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
 *   - Default (local dev): the Workspace API ConfigFiles folder so the app can
 *     serve them without extra setup.
 *   - Deploy: set CORSAIR_CONFIG_DIR to a dedicated shared path (e.g.
 *     /var/www/aventisia.com/files/config/corsair) so the configs live outside
 *     the Workspace API codebase and a Corsair change does not force a main app
 *     rebuild. The Workspace API reads from that shared path at runtime.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCorsair } from "corsair";
import { plugins } from "./plugins.js";
import { generateDcpFiles } from "./dcp-generator/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Output root for Corsair config artifacts. Defaults to the Workspace API
// ConfigFiles folder for local dev; override with CORSAIR_CONFIG_DIR in deploy
// to write to a dedicated shared path outside the main app codebase.
const repoRoot = path.resolve(__dirname, "../../..");
const defaultOutputDir = path.join(
  repoRoot,
  "apis/WorcBackend-legacy/WorkspaceAPIs/Features/CloudConnectors/ConfigFiles",
);
const outputDir = process.env.CORSAIR_CONFIG_DIR
  ? path.resolve(process.env.CORSAIR_CONFIG_DIR)
  : defaultOutputDir;

// The global Cloud Connector mapping is owned by the Workspace API codebase.
// Even when Corsair configs go to a shared path (CORSAIR_CONFIG_DIR), the
// global mapping stays in the Workspace API codebase so the cleanup targets
// the real file. Override with CORSAIR_GLOBAL_MAPPING_FILE when the Workspace
// API codebase is not present (e.g. in the sidecar container).
const globalMappingFile = process.env.CORSAIR_GLOBAL_MAPPING_FILE
  ? path.resolve(process.env.CORSAIR_GLOBAL_MAPPING_FILE)
  : path.join(
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

console.log(`[corsair:generate] Writing config artifacts to ${outputDir}`);

generateDcpFiles({
  outputDir,
  plugins,
  corsair,
  globalMappingFile,
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
