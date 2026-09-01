/**
 * Corsair → Studio Cloud Connector DCP generator (CLI entry point).
 *
 * Reads the Corsair sidecar's `/api/corsair/tools` output and generates:
 *   1. Per-action Cloud Connector config JSON files (Studio DCP format)
 *   2. Action-selector metadata merged into the Cloud Connector mapping
 *   3. Deterministic OpenAPI specs (used to seed ws_Tools, mirroring Camel)
 *
 * Usage:
 *   CORSAIR_SIDECAR_URL=http://localhost:3456 npm run generate:dcp
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCorsair } from "corsair";
import { plugins } from "./plugins.js";
import { generateDcpFiles } from "./dcp-generator/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Output root: the Cloud Connectors ConfigFiles folder in WorkspaceAPIs.
const repoRoot = path.resolve(__dirname, "../../..");
const outputDir = path.join(
  repoRoot,
  "apis/WorcBackend-legacy/WorkspaceAPIs/Features/CloudConnectors/ConfigFiles",
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

generateDcpFiles({ outputDir, plugins, corsair }).catch((err) => {
  console.error(err);
  process.exit(1);
});
