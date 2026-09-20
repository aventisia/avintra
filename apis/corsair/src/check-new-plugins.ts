/**
 * Corsair plugin drift checker + onboarding tool.
 *
 * Corsair is an evolving upstream project (corsairdev/corsair). New integration
 * plugins are added to its `packages/` directory over time. This tool:
 *
 *   1. CHECK  — compares the upstream plugin set against the plugins we depend
 *               on in this sidecar and reports NEW plugins we lack, plus which
 *               onboarding artifacts are missing for each.
 *   2. ONBOARD — provisions a new plugin:
 *                  a. add `@corsair-dev/<id>` to package.json dependencies
 *                  b. register it in src/plugins.ts (import + instantiate)
 *
 * No base URL is added: Corsair tools are platform tools (test/playground is
 * hidden) and execution goes through the Corsair sidecar, so a base URL is
 * unnecessary.
 *
 * Config regeneration (`generate:configs`) and tool seeding (`seed:tools`) are
 * intentionally NOT part of onboarding — they are separate scripts that the
 * operator runs explicitly after onboarding (see README).
 *
 * "Our" plugin set is derived from the `@corsair-dev/*` dependencies in
 * package.json (the same list src/plugins.ts imports and registers). The
 * upstream list is fetched live from the GitHub API, so it never goes stale.
 *
 * Usage:
 *   npm run plugins:check                 # list new upstream plugins we lack
 *   npm run plugins:onboard -- <id>        # onboard one plugin
 *   npm run plugins:onboard -- --all       # onboard every missing plugin
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const corsairDir = path.resolve(__dirname, "..");
const packageJsonPath = path.join(corsairDir, "package.json");
const pluginsTsPath = path.join(corsairDir, "src/plugins.ts");
/** Workspace folders under upstream `packages/` that are NOT integration plugins. */
const NON_PLUGIN_DIRS = new Set([
  "corsair",
  "cli",
  "mcp",
  "ui",
  "studio",
  "app",
]);

const UPSTREAM_PACKAGES_URL =
  "https://api.github.com/repos/corsairdev/corsair/contents/packages";

interface UpstreamEntry {
  name: string;
  type: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Reading current state
// ─────────────────────────────────────────────────────────────────────────────

function readJson(filePath: string): Record<string, any> {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

/** Read the `@corsair-dev/*` plugin deps we currently depend on. */
function readOurPluginIds(): string[] {
  const pkg = readJson(packageJsonPath);
  return Object.keys(pkg.dependencies ?? {})
    .filter((name) => name.startsWith("@corsair-dev/"))
    .map((name) => name.slice("@corsair-dev/".length))
    .sort();
}

/** Fetch the upstream `packages/` directory listing from the GitHub API. */
async function fetchUpstreamPluginIds(): Promise<string[]> {
  const res = await fetch(UPSTREAM_PACKAGES_URL, {
    headers: { "User-Agent": "worc-platform-corsair-drift-check" },
  });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch upstream plugin list (HTTP ${res.status}). ` +
        `Check network access to ${UPSTREAM_PACKAGES_URL}.`,
    );
  }
  const entries = (await res.json()) as UpstreamEntry[];
  return entries
    .filter((e) => e.type === "dir")
    .map((e) => e.name)
    .filter((name) => !NON_PLUGIN_DIRS.has(name) && !name.startsWith("frpc-"))
    .sort();
}

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding edits
// ─────────────────────────────────────────────────────────────────────────────

/** Insert a line into a sorted block of lines, keeping alphabetical order. */
function insertSorted(lines: string[], line: string): string[] {
  const out = [...lines];
  let idx = out.findIndex((l) => l.localeCompare(line) > 0);
  if (idx === -1) idx = out.length;
  out.splice(idx, 0, line);
  return out;
}

/** Fetch the latest stable version of a package from the npm registry. */
async function fetchLatestVersion(packageName: string): Promise<string> {
  const res = await fetch(`https://registry.npmjs.org/${packageName}`, {
    headers: { "User-Agent": "worc-platform-corsair-onboard" },
  });
  if (!res.ok) {
    throw new Error(
      `Could not resolve latest version for ${packageName} (HTTP ${res.status}).`,
    );
  }
  const data = (await res.json()) as { "dist-tags"?: { latest?: string } };
  const latest = data["dist-tags"]?.latest;
  if (!latest) {
    throw new Error(`No dist-tags.latest found for ${packageName}.`);
  }
  return latest;
}

/** Add `@corsair-dev/<id>` to package.json dependencies (alphabetical). */
async function addToPackageJson(id: string): Promise<void> {
  const pkg = readJson(packageJsonPath);
  const dep = `@corsair-dev/${id}`;
  if (!pkg.dependencies[dep]) {
    // Resolve the latest stable version from npm rather than hardcoding one —
    // not every plugin publishes 0.1.0.
    const version = await fetchLatestVersion(dep);
    pkg.dependencies[dep] = version;
  }
  const sorted: Record<string, string> = {};
  for (const key of Object.keys(pkg.dependencies).sort()) {
    sorted[key] = pkg.dependencies[key];
  }
  pkg.dependencies = sorted;
  writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
  console.log(`  ✓ package.json: added ${dep}@${pkg.dependencies[dep]}`);
}

/** Add import + instantiation to src/plugins.ts (alphabetical). */
function addToPluginsTs(id: string): void {
  let src = readFileSync(pluginsTsPath, "utf8");

  const importLine = `import { ${id} } from "@corsair-dev/${id}";`;
  if (!src.includes(`@corsair-dev/${id}`)) {
    // Insert after the polyfill import, keeping the import block alphabetical.
    const lines = src.split("\n");
    const polyfillIdx = lines.findIndex((l) => l.includes("./polyfills.js"));
    const insertAt = polyfillIdx + 1;
    const importLines = lines.slice(insertAt);
    const [head, ...tail] = importLines;
    const sorted = insertSorted(tail, importLine);
    lines.splice(insertAt, importLines.length, head, ...sorted);
    src = lines.join("\n");
  }

  // Insert the factory call into the plugins array, alphabetically.
  const factoryLine = `  ${id}(),`;
  if (!new RegExp(`\\b${id}\\(`).test(src)) {
    const arrayStart = src.indexOf("export const plugins = [");
    const arrayEnd = src.indexOf("] as const;", arrayStart);
    const before = src.slice(0, arrayStart);
    const arrayBody = src.slice(arrayStart, arrayEnd);
    const after = src.slice(arrayEnd);

    // Split the array body into the header line + element lines.
    const firstBracket = arrayBody.indexOf("[");
    const header = arrayBody.slice(0, firstBracket + 1);
    const bodyLines = arrayBody
      .slice(firstBracket + 1)
      .split("\n")
      .filter((l) => l.trim().length > 0);

    // Keep the workday comment block attached to its line.
    const sortedBody = insertSorted(bodyLines, factoryLine);
    src = before + header + "\n" + sortedBody.join("\n") + "\n" + after;
  }

  writeFileSync(pluginsTsPath, src, "utf8");
  console.log(`  ✓ plugins.ts: registered ${id}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Commands
// ─────────────────────────────────────────────────────────────────────────────

async function check(): Promise<void> {
  const ours = new Set(readOurPluginIds());
  const upstream = await fetchUpstreamPluginIds();
  const newPlugins = upstream.filter((id) => !ours.has(id));

  console.log(`Our plugins:        ${ours.size}`);
  console.log(`Upstream plugins:   ${upstream.length}`);
  console.log(`New plugins (ours lacks): ${newPlugins.length}`);
  console.log("");

  if (newPlugins.length === 0) {
    console.log("✅ Up to date — no new upstream plugins to add.");
    return;
  }

  for (const id of newPlugins) {
    console.log(`  - @corsair-dev/${id}`);
  }
  console.log("");
  console.log("To onboard: `npm run plugins:onboard -- <id>` (or `-- --all`).");
}

async function onboard(ids: string[]): Promise<void> {
  for (const id of ids) {
    console.log(`\n=== Onboarding @corsair-dev/${id} ===`);
    await addToPackageJson(id);
    addToPluginsTs(id);
  }

  console.log("\n✅ Onboarding complete.");
  console.log("Next steps:");
  console.log("  1. Run `npm install` (with --legacy-peer-deps) if new deps were added");
  console.log("  2. Run `npm run generate:configs` to refresh configs/mapping/catalog/OpenAPI");
  console.log("  3. Run `npm run seed:tools` to seed tools into ws_Tools");
  console.log("  4. Commit the generated artifacts + new plugin registration.");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (cmd === "check" || cmd === undefined) {
    await check();
    return;
  }

  if (cmd === "onboard") {
    const rest = args.slice(1);
    const targets = rest.filter((a) => !a.startsWith("--"));

    let ids: string[];
    if (targets.length > 0) {
      ids = targets;
    } else if (rest.includes("--all")) {
      const ours = new Set(readOurPluginIds());
      ids = (await fetchUpstreamPluginIds()).filter((id) => !ours.has(id));
    } else {
      console.error(
        "Usage: npm run plugins:onboard -- <id> [<id>...] | --all",
      );
      process.exit(1);
    }

    await onboard(ids);
    return;
  }

  console.error(
    "Unknown command. Usage:\n" +
      "  npm run plugins:check\n" +
      "  npm run plugins:onboard -- <id> [<id>...] | --all",
  );
  process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
