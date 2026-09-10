/**
 * Corsair tools seeding script — sidecar-owned artifact seeding.
 *
 * This script seeds Corsair-provided tools into the Workspace database (ws_Tools table)
 * as part of the Corsair deployment pipeline. It uses the shared generateToolMetadata()
 * function to build tool specs directly from the Corsair plugin registry (no file dependency).
 *
 * Idempotent: safe to run repeatedly. Seeded tools are matched by deterministic ID and
 * updated on every run.
 *
 * Typical usage:
 *   npm run seed:tools
 *
 * Environment variables required:
 *   - WORKSPACE_POSTGRES_HOST, WORKSPACE_POSTGRES_PORT, WORKSPACE_POSTGRES_USERNAME,
 *     WORKSPACE_POSTGRES_PASSWORD (Workspace database connection)
 *
 * Platform (library) tools are seeded with empty (Guid.Empty) tenant and user
 * ids so they are free from both tenant and user constraints and available to
 * every tenant. Because ws_Tools has a foreign key on
 * CreatedByUserId/LastModifiedByUserId, a dedicated system WorkspaceUser with
 * Guid.Empty id is ensured to exist and referenced as the owner.
 */
import dotenv from "dotenv";
import pg from "pg";
import crypto from "node:crypto";
import { createCorsair } from "corsair";
// Import plugins directly from plugins.js (NOT corsair.js). corsair.js eagerly
// calls createCorsair({ kek: process.env.CORSAIR_KEK! }) at module load, which
// throws CorsairKekMissingError when CORSAIR_KEK is not set (e.g. the seed step
// on the server). The seed only needs the plugin list and builds its own
// self-contained corsair instance below.
import { plugins } from "./plugins.js";
import { generateToolMetadata } from "./generate-tool-metadata.js";

// Load defaults first, then allow .env.local to override with real local values.
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

const { Pool } = pg;

const WORKSPACE_DATABASE = "WorkspaceDb";

// Platform (library) tools are free from both tenant and user constraints.
// They are seeded with empty (Guid.Empty) tenant and user ids so they are not
// owned by any single tenant or user and appear in every tenant's library.
const PLATFORM_TENANT_ID = "00000000-0000-0000-0000-000000000000";
const PLATFORM_USER_ID = "00000000-0000-0000-0000-000000000000";
const PLATFORM_USER_NAME = "system";

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

/**
 * Ensure a dedicated system WorkspaceUser (Guid.Empty id/tenant) exists.
 * ws_Tools has a foreign key on CreatedByUserId/LastModifiedByUserId, so the
 * library tools must reference a real WorkspaceUser row. Idempotent.
 */
async function ensureSystemUser(): Promise<void> {
  const existing = await workspacePool.query(
    `SELECT "Id" FROM "WorkspaceUsers" WHERE "Id" = $1`,
    [PLATFORM_USER_ID]
  );
  if (existing.rows.length > 0) return;

  await workspacePool.query(
    `INSERT INTO "WorkspaceUsers" ("Id", "TenantId", "UserName", "FirstName", "LastName")
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT ("Id") DO NOTHING`,
    [PLATFORM_USER_ID, PLATFORM_TENANT_ID, PLATFORM_USER_NAME, "System", "User"]
  );
  console.log("[corsair:seed] Ensured system WorkspaceUser for platform tools.");
}

/** Seed Corsair tools generated from the plugin registry into ws_Tools. */
async function seedCorsairTools(): Promise<void> {
  try {
    // Create a self-contained corsair instance for schema introspection.
    const corsair = createCorsair({
      multiTenancy: true,
      plugins,
      database: undefined,
      kek: "0000000000000000000000000000000000000000000000000000000000000000",
    });

    console.log("[corsair:seed] Ensuring system WorkspaceUser...");
    await ensureSystemUser();

    console.log("[corsair:seed] Generating tool metadata from plugin registry...");
    const generatedTools = await generateToolMetadata(plugins, corsair);

    if (generatedTools.length === 0) {
      console.warn("[corsair:seed] No Corsair tools generated.");
      return;
    }

    const now = new Date().toISOString();
    let seedCount = 0;

    // These enums are persisted as strings via EF Core's EnumToStringConverter:
    //   - ComponentTypeEnum: "Platform" | "Custom"
    //   - ConfigureEnvironmentType: "Dev" | "Prod"
    //   - ToolAuthenticationTypeEnum: "None" | "ApiKeyHeader" | ...
    const TOOL_TYPE_PLATFORM = "Platform";
    const envType = process.env.WORKSPACE_ENV_TYPE === "prod" ? "Prod" : "Dev";
    const AUTH_TYPE_NONE = "None";

    for (const tool of generatedTools) {
      const toolName = `${toPascalCase(tool.id)}`;
      const toolId = deterministicGuid(`corsair-tool-${toolName}`);

      try {
        // Parse the OpenAPI spec (already JSON string from generateToolMetadata).
        const spec = JSON.parse(tool.openApiSpec);
        // Store the full spec (which has a top-level "paths" key) as the parsed
        // schema. The frontend's normalizeToolOperations reads schema.paths, and
        // the .NET FlattenOpenApiSpec produces { info, servers, paths } — so the
        // parsed schema must expose "paths" at the top level, not the bare paths
        // object, otherwise the detail page shows no operations.
        const parsedSchema = JSON.stringify(spec);

        const toolRow = {
          Id: toolId,
          TenantId: PLATFORM_TENANT_ID,
          SpaceId: null,
          EnvType: envType,
          Name: toolName,
          Description: tool.description,
          Type: TOOL_TYPE_PLATFORM,
          BaseUrl: tool.baseUrl,
          OpenApiSpec: tool.openApiSpec,
          ParsedSchema: parsedSchema,
          AuthenticationType: AUTH_TYPE_NONE,
          IsTenantWideAccess: true,
          IsActive: true,
          IsVerified: true,
          IsDisabled: false,
          CreatedByUserId: PLATFORM_USER_ID,
          LastModifiedByUserId: PLATFORM_USER_ID,
          CreatedOn: now,
          LastModifiedOn: now,
        };

        // Check if tool already exists (by toolId).
        const existingResult = await workspacePool.query(
          `SELECT "Id" FROM "ws_Tools" WHERE "Id" = $1`,
          [toolId]
        );

        if (existingResult.rows.length === 0) {
          await workspacePool.query(
            `INSERT INTO "ws_Tools" ("Id", "TenantId", "SpaceId", "EnvType", "Name", "Description", "Type", "BaseUrl", "OpenApiSpec", "ParsedSchema", "AuthenticationType", "IsTenantWideAccess", "IsActive", "IsVerified", "IsDisabled", "CreatedByUserId", "LastModifiedByUserId", "CreatedOn", "LastModifiedOn")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
            [
              toolRow.Id,
              toolRow.TenantId,
              toolRow.SpaceId,
              toolRow.EnvType,
              toolRow.Name,
              toolRow.Description,
              toolRow.Type,
              toolRow.BaseUrl,
              toolRow.OpenApiSpec,
              toolRow.ParsedSchema,
              toolRow.AuthenticationType,
              toolRow.IsTenantWideAccess,
              toolRow.IsActive,
              toolRow.IsVerified,
              toolRow.IsDisabled,
              toolRow.CreatedByUserId,
              toolRow.LastModifiedByUserId,
              toolRow.CreatedOn,
              toolRow.LastModifiedOn,
            ]
          );
          console.log(`[corsair:seed] Seeded new tool ${toolName} (${toolId}).`);
        } else {
          await workspacePool.query(
            `UPDATE "ws_Tools" SET
               "Name" = $1,
               "Description" = $2,
               "BaseUrl" = $3,
               "OpenApiSpec" = $4,
               "ParsedSchema" = $5,
               "EnvType" = $6,
               "Type" = $7,
               "TenantId" = $8,
               "IsTenantWideAccess" = true,
               "IsActive" = true,
               "IsVerified" = true,
               "IsDisabled" = false,
               "LastModifiedByUserId" = $9,
               "LastModifiedOn" = $10
             WHERE "Id" = $11`,
            [
              toolName,
              tool.description,
              tool.baseUrl,
              tool.openApiSpec,
              parsedSchema,
              envType,
              TOOL_TYPE_PLATFORM,
              PLATFORM_TENANT_ID,
              PLATFORM_USER_ID,
              now,
              toolId,
            ]
          );
          console.log(`[corsair:seed] Updated existing tool ${toolName} (${toolId}).`);
        }

        seedCount++;
      } catch (err) {
        console.error(`[corsair:seed] Failed to seed tool ${tool.pluginId}:`, err);
      }
    }

    console.log(`[corsair:seed] Seeded ${seedCount} Corsair tool(s) into ws_Tools.`);
  } catch (err) {
    console.error("[corsair:seed] Error generating tool metadata:", err);
    throw err;
  }
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
