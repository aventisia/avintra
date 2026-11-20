/**
 * Corsair tools seeding script — sidecar-owned artifact seeding.
 *
 * This script seeds Corsair-provided tools into the Workspace database
 * (ai_PlatformTools table) as part of the Corsair deployment pipeline. It uses
 * the shared generateToolMetadata() function to build tool specs directly from
 * the Corsair plugin registry (no file dependency).
 *
 * Rows are identified by a deterministic id derived from the plugin id, so a
 * re-run updates the existing row in place and keeps its id. The stored Name is
 * the product display name; a separate popular-tools.json decides which names
 * are marked IsPopular (a missing or malformed file aborts the pass). IsDisabled
 * is written only on insert, so an operator-disabled row stays disabled across
 * re-runs.
 *
 * Typical usage:
 *   npm run seed:tools
 *
 * Environment variables required:
 *   - POSTGRESQL_HOST, POSTGRESQL_PORT, POSTGRESQL_USERNAME, POSTGRESQL_PASSWORD,
 *     POSTGRESQL_WORKSPACE_DB_NAME (Workspace database connection)
 */
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import crypto from "node:crypto";
import { createCorsair } from "corsair";
// Import plugins directly from plugins.js (NOT corsair.js). corsair.js eagerly
// calls createCorsair({ kek: process.env.CORSAIR_KEK! }) at module load, which
// throws CorsairKekMissingError when CORSAIR_KEK is not set (e.g. the seed step
// on the server). The seed only needs the plugin list and builds its own
// self-contained corsair instance below.
import { plugins } from "./plugins.js";
import { generateToolMetadata, type GeneratedToolMetadata } from "./generate-tool-metadata.js";

// --- Variable selection precedence ---
// Config is resolved in this order (highest wins):
//   1. System environment variables (server: systemd Environment=/EnvironmentFile=;
//      local: setx /M or $env:). These are authoritative.
//   2. .env.local  (local dev overrides, gitignored)
//   3. .env        (committed defaults)
// dotenv never overrides an already-set variable, so anything present in the
// process environment wins over both .env files. This keeps the server and
// local dev on the same config source.
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const { Pool } = pg;

const WORKSPACE_DATABASE = process.env.POSTGRESQL_WORKSPACE_DB_NAME || "WorkspaceDb";

// popular-tools.json lives in src/data. The cwd candidate covers
// `npm run seed:tools` from apis/corsair; the module-relative candidate covers
// the compiled dist/ entry point, where the Dockerfile places the same file.
const POPULAR_TOOLS_PATH_CANDIDATES = [
  path.resolve(process.cwd(), "src/data/popular-tools.json"),
  fileURLToPath(new URL("./data/popular-tools.json", import.meta.url)),
];

const workspacePool = new Pool({
  host: process.env.POSTGRESQL_HOST,
  port: Number(process.env.POSTGRESQL_PORT || "5432"),
  database: WORKSPACE_DATABASE,
  user: process.env.POSTGRESQL_USERNAME,
  password: process.env.POSTGRESQL_PASSWORD,
});

/** Generate a deterministic GUID from a seed string (matching .NET's DeterministicGuid). */
function deterministicGuid(seed: string): string {
  const hash = crypto
    .createHash("md5")
    .update(seed, "utf8")
    .digest();

  // Set version to 4 (random) and variant bits per RFC 4122.
  hash[6] = (hash[6] & 0x0f) | 0x40;
  hash[8] = (hash[8] & 0x3f) | 0x80;

  const hex = hash.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Convert a plugin id (e.g. "googlecalendar") to PascalCase ("GoogleCalendar"). */
function toPascalCase(value: string): string {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function warn(message: string): void {
  console.warn(`[corsair:seed] ${message}`);
}

/**
 * Read the configured popular names. A missing or malformed file aborts the pass:
 * continuing would silently clear every existing popular mark on the next update.
 */
function loadPopularToolNames(): string[] {
  const popularFilePath = POPULAR_TOOLS_PATH_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  if (!popularFilePath) {
    throw new Error(`Popular tools file not found (${POPULAR_TOOLS_PATH_CANDIDATES.join(", ")}).`);
  }

  let parsed: { popularTools?: unknown };
  try {
    parsed = JSON.parse(fs.readFileSync(popularFilePath, "utf8")) as { popularTools?: unknown };
  } catch (err) {
    throw new Error(`Popular tools file ${popularFilePath} could not be read or parsed (${(err as Error).message}).`);
  }

  if (!Array.isArray(parsed.popularTools)) {
    throw new Error(`Popular tools file ${popularFilePath} has no popularTools list.`);
  }

  return parsed.popularTools
    .map((entry) => {
      const name = (entry as { name?: unknown } | null | undefined)?.name;
      if (typeof name !== "string" || name.trim().length === 0) {
        warn(`Ignoring popular-tools entry without a non-empty name: ${JSON.stringify(entry)}.`);
        return "";
      }
      return name.trim();
    })
    .filter((name) => name.length > 0);
}

/**
 * Resolve the popular subset with warning-only validation. A duplicated list
 * entry, an unmatched name, an ambiguous name, or a display name shared by more
 * than one catalog entry warns and continues; ambiguous names are not marked.
 */
function resolvePopularToolNames(
  generatedTools: GeneratedToolMetadata[],
  popularNames: string[],
): Set<string> {
  const catalogNames = new Map<string, string[]>();
  for (const tool of generatedTools) {
    const displayName = tool.name.trim();
    const key = displayName.toLowerCase();
    catalogNames.set(key, [...(catalogNames.get(key) ?? []), displayName]);
  }

  for (const names of catalogNames.values()) {
    if (names.length > 1) {
      warn(`Catalog display name '${names[0]}' is shared by ${names.length} entries (${names.join(", ")}); seeding them not popular.`);
    }
  }

  const popularNameCounts = new Map<string, { displayName: string; count: number }>();
  for (const popularName of popularNames) {
    const key = popularName.toLowerCase();
    const existing = popularNameCounts.get(key);
    popularNameCounts.set(key, {
      displayName: existing?.displayName ?? popularName,
      count: (existing?.count ?? 0) + 1,
    });
  }

  const popularKeys = new Set<string>();
  for (const [key, { displayName, count }] of popularNameCounts) {
    if (count > 1) {
      warn(`Popular tool '${displayName}' is listed ${count} times; marking it once.`);
    }

    const matches = catalogNames.get(key) ?? [];
    if (matches.length === 0) {
      warn(`Popular tool '${displayName}' matches no catalog entry.`);
      continue;
    }
    if (matches.length > 1) {
      warn(`Popular tool '${displayName}' matches ${matches.length} catalog entries (${matches.join(", ")}); leaving it not popular.`);
      continue;
    }

    popularKeys.add(key);
  }

  return popularKeys;
}

/** Seed Corsair tools generated from the plugin registry into ai_PlatformTools. */
async function seedCorsairTools(): Promise<void> {
  // A failing connection must fail the command, not be reported per tool.
  await workspacePool.query("SELECT 1");

  const corsair = createCorsair({
    multiTenancy: true,
    plugins,
    database: undefined,
    kek: "0000000000000000000000000000000000000000000000000000000000000000",
  });

  console.log("[corsair:seed] Generating tool metadata from plugin registry...");
  const generatedTools = await generateToolMetadata(plugins, corsair);

  if (generatedTools.length === 0) {
    throw new Error("No Corsair tools were generated from the plugin registry.");
  }

  const popularToolNames = loadPopularToolNames();
  const popularKeys = resolvePopularToolNames(generatedTools, popularToolNames);

  let seedCount = 0;
  let popularCount = 0;
  const claimedNames = new Set<string>();
  const failedPlugins: string[] = [];

  for (const tool of generatedTools) {
    const toolName = tool.name.trim();
    const toolId = deterministicGuid(`corsair-tool-${toPascalCase(tool.id)}`);

    try {
      if (!toolName) {
        warn(`Skipping plugin '${tool.pluginId}': it has no display name.`);
        continue;
      }

      // IMPORTANT NOTE: ai_PlatformTools has a unique index on Name; a catalog
      // duplicate would abort the pass, so warn and skip the later row.
      const claimedNameKey = toolName.toLowerCase();
      if (claimedNames.has(claimedNameKey)) {
        warn(`Skipping plugin '${tool.pluginId}': display name '${toolName}' is already seeded by another entry.`);
        continue;
      }
      claimedNames.add(claimedNameKey);

      const isPopular = popularKeys.has(claimedNameKey);
      const parsedSchema = JSON.stringify(JSON.parse(tool.openApiSpec));

      const existingResult = await workspacePool.query(
        `SELECT "Id" FROM "ai_PlatformTools" WHERE "Id" = $1`,
        [toolId]
      );

      if (existingResult.rows.length === 0) {
        await workspacePool.query(
          `INSERT INTO "ai_PlatformTools" ("Id", "Name", "Description", "OpenApiSpec", "ParsedSchema", "IsPopular", "IsDisabled")
           VALUES ($1, $2, $3, $4, $5::jsonb, $6, false)`,
          [toolId, toolName, tool.description, tool.openApiSpec, parsedSchema, isPopular]
        );
      } else {
        // IMPORTANT NOTE: a stale row already holding this name under a different id must be
        // reconciled by an operator; letting the update run would violate the unique Name index.
        const conflictingRow = await workspacePool.query(
          `SELECT "Id" FROM "ai_PlatformTools" WHERE "Name" = $1 AND "Id" <> $2`,
          [toolName, toolId]
        );
        if (conflictingRow.rows.length > 0) {
          throw new Error(
            `display name '${toolName}' is already held by row ${conflictingRow.rows[0].Id}.`
          );
        }

        await workspacePool.query(
          `UPDATE "ai_PlatformTools" SET
             "Name" = $1,
             "Description" = $2,
             "OpenApiSpec" = $3,
             "ParsedSchema" = $4::jsonb,
             "IsPopular" = $5
           WHERE "Id" = $6`,
          [toolName, tool.description, tool.openApiSpec, parsedSchema, isPopular, toolId]
        );
      }

      seedCount++;
      if (isPopular) popularCount++;
    } catch (err) {
      failedPlugins.push(tool.pluginId);
      warn(`Failed to seed plugin '${tool.pluginId}': ${(err as Error).message}`);
    }
  }

  if (seedCount === 0) {
    throw new Error("No Corsair tools were seeded; check the Workspace database connection and columns.");
  }

  if (failedPlugins.length > 0) {
    throw new Error(
      `Failed to seed ${failedPlugins.length} plugin(s): ${failedPlugins.join(", ")}.`
    );
  }

  console.log(`[corsair:seed] Seeded ${seedCount} Corsair tools (${popularCount} popular) into ai_PlatformTools.`);
}

async function main() {
  try {
    console.log("[corsair:seed] Seeding Corsair tools...");
    await seedCorsairTools();

    console.log("[corsair:seed] Corsair tools seeding complete.");
  } catch (err) {
    console.error("[corsair:seed] Seeding failed:", err);
    process.exit(1);
  } finally {
    await workspacePool.end();
  }
}

main();
