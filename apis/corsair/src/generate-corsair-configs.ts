/**
 * Corsair configuration artifact generator (sidecar-managed asset builder).
 *
 * This script introspects the registered Corsair plugins and generates static
 * configuration artifacts (action configs, metadata mappings, OpenAPI specs) that
 * the Workspace API uses for display and invocation. It is owned by the Corsair
 * sidecar deployment flow and runs independently from the main app build.
 *
 * Typical usage:
 *   npm run generate:configs
 *
 * Output location:
 *   - The small sibling artifacts (action map, integration catalog, vault-type
 *     map) always go to the Workspace API codebase ConfigFiles folder
 *     (Features/CloudConnectors/ConfigFiles).
 *   - The Corsair action-selector mapping file and the thousands of per-plugin
 *     configs go to CORSAIR_CONFIG_DIR when set (server deploy dir, e.g.
 *     /var/www/aventisia.com/files/configs/Corsair); otherwise they fall back to
 *     the codebase ConfigFiles folder for local development.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCorsair } from "corsair";
import { plugins } from "./plugins.js";
import { generateDcpFiles } from "./dcp-generator/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Output root for the mapping and sibling artifacts. Always the Workspace API
// codebase ConfigFiles folder — the same folder the Workspace API serves and
// reads the committed artifacts from.
const repoRoot = path.resolve(__dirname, "../../..");
const outputDir = path.join(
  repoRoot,
  "apis/WorcBackend-legacy/WorkspaceAPIs/Features/CloudConnectors/ConfigFiles",
);

// Per-plugin config root. When CORSAIR_CONFIG_DIR is set (Jenkins/server deploy)
// the thousands of per-plugin configs are written there so they do not bloat the
// codebase. When unset (local dev) they fall back to the codebase ConfigFiles/
// Corsair folder, which every dev shares.
const configRoot = process.env.CORSAIR_CONFIG_DIR
  ? path.resolve(process.env.CORSAIR_CONFIG_DIR)
  : path.join(outputDir, "Corsair");

// The global Cloud Connector mapping is owned by the Workspace API codebase and
// lives in the same ConfigFiles folder.
const globalMappingFile = path.join(
  repoRoot,
  "apis/WorcBackend-legacy/WorkspaceAPIs/Features/CloudConnectors/ConfigFiles/CloudConnectorActionSelectorMappingFile.json",
);

// Build a self-contained corsair instance for schema introspection. No database
// is required for `listOperations`/`getStructuredSchema`; a placeholder kek is
// used only to satisfy the constructor.
const corsair = createCorsair({
  multiTenancy: true,
  plugins,
  database: undefined,
  kek: "0000000000000000000000000000000000000000000000000000000000000000",
});

console.log(`[corsair:generate] Writing mapping/sibling artifacts to ${outputDir}`);
console.log(`[corsair:generate] Writing per-plugin configs to ${configRoot}`);

generateDcpFiles({
  outputDir,
  configRoot,
  plugins,
  corsair,
  globalMappingFile,
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
