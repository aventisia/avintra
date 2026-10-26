/**
 * Corsair → Studio Cloud Connector DCP generator orchestrator.
 *
 * Reads the Corsair sidecar's `/api/corsair/tools` output and generates:
 *   1. Per-action Cloud Connector config JSON files (Studio DCP format)
 *   2. Action-selector metadata merged into the Cloud Connector mapping
 *   3. Deterministic OpenAPI specs (used to seed ai_Tools, mirroring Camel)
 *
 * The generator supports all registered plugins and emits only the standard
 * Cloud Connector config shape (no extra properties, no dedicated node type).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listOperations, getStructuredSchema } from "corsair";
import type {
  ActionSelectorCategory,
  CorsairActionInvocation,
  GenerateDcpOptions,
} from "./types.js";
import {
  DEFAULT_ICON_MAP,
  toPluginMetadataList,
} from "./plugin-metadata.js";
import { buildActionConfig } from "./build-action-config.js";
import {
  buildActionSelectorAction,
  buildCorsairMapping,
  buildPluginCategory,
  cleanCorsairFromGlobalMapping,
  loadExistingMapping,
} from "./build-mapping.js";
import { buildOpenApiSpec } from "./build-openapi.js";
import { buildIntegrationCatalog, buildVaultCredentialConfigs } from "./integration-catalog.js";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

/** A tool descriptor derived from the corsair instance in-process. */
type CorsairTool = {
  path: string;
  plugin: string;
  description?: string;
  input: any;
  output: any;
};

/**
 * Introspect the corsair instance in-process to build the tool list.
 * This avoids requiring a running sidecar HTTP endpoint, so generation works
 * at build time.
 */
function listTools(corsair: unknown): CorsairTool[] {
  const operations = listOperations(corsair as any);
  const paths = operations.split("\n").filter(Boolean);
  return paths.map((path) => {
    const schema = getStructuredSchema(corsair as any, path);
    return {
      path,
      plugin: path.split(".")[0],
      description: schema?.description,
      input: schema?.input,
      output: schema?.output,
    };
  });
}

/** Write a JSON file with a trailing newline. */
function writeJson(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

/** Generate only new vault credential forms; reviewed legacy forms remain authoritative. */
function writeMissingVaultCredentialConfigs(configs: ReturnType<typeof buildVaultCredentialConfigs>): void {
  const vaultCredentialConfigDir = process.env.CORSAIR_VAULT_CREDENTIAL_CONFIG_DIR
    ? path.resolve(process.env.CORSAIR_VAULT_CREDENTIAL_CONFIG_DIR)
    : path.resolve(moduleDir, "../../../../clients/web-apps/apps/workspace/src/features/dynamic-config-panel/constants/config-json");

  for (const config of configs) {
    const filePath = path.join(vaultCredentialConfigDir, config.vaultCredentialType + ".json");
    if (!fs.existsSync(filePath)) {
      writeJson(filePath, config.fields);
      continue;
    }

    try {
      const existing = JSON.parse(fs.readFileSync(filePath, "utf8"));
      if (Array.isArray(existing) && existing.length === 0) {
        writeJson(filePath, config.fields);
      }
    } catch {
      // Leave malformed or manually maintained files for explicit review.
    }
  }
}

/**
 * Generate all required files from the registered Corsair plugins.
 *
 * @param options output directory, plugins, corsair instance, and optional maps
 */
export async function generateDcpFiles(options: GenerateDcpOptions): Promise<void> {
  const {
    outputDir,
    plugins,
    corsair,
    iconMap = DEFAULT_ICON_MAP,
    globalMappingFile,
    configRoot,
  } = options;

  if (!corsair) {
    throw new Error("generateDcpFiles requires a corsair instance to introspect schemas.");
  }

  const pluginMetas = toPluginMetadataList(plugins, iconMap);
  const tools = listTools(corsair);

  // Per-plugin configs + OpenAPI specs go to the explicit config root when
  // provided (server deploy dir); otherwise they fall back to outputDir/Corsair
  // (local dev). The mapping and sibling artifacts always go to outputDir.
  const configRootResolved = configRoot ?? path.join(outputDir, "Corsair");
  // The dedicated Corsair action-selector mapping is a Corsair artifact. On the
  // server it lives alongside the per-plugin configs in the deploy dir; locally
  // it falls back to the codebase ConfigFiles root.
  const corsairMappingFile = configRoot
    ? path.join(configRoot, "CorsairActionSelectorMappingFile.json")
    : path.join(outputDir, "CorsairActionSelectorMappingFile.json");
  // The global mapping is owned by the Workspace API codebase and lives in the
  // same ConfigFiles folder as the Corsair configs, so cleanup targets that file.
  // Defaults to outputDir/CloudConnectorActionSelectorMappingFile.json.
  const globalMappingFileResolved = globalMappingFile
    ?? path.join(outputDir, "CloudConnectorActionSelectorMappingFile.json");
  const actionMapFile = path.join(outputDir, "CorsairActionMap.json");
  const integrationCatalogFile = path.join(outputDir, "CorsairIntegrationCatalog.json");
  const vaultCredentialTypeMapFile = path.join(outputDir, "CorsairVaultCredentialTypeToPluginId.json");
  const frontendCatalogFile = path.resolve(
    moduleDir,
    "../../../../clients/web-apps/apps/workspace/src/features/02-configure/vault-credentials/vault-credential-config/constants/corsair-integration-catalog.json",
  );
  const openApiDir = path.join(configRootResolved, "openapi");

  const categories: ActionSelectorCategory[] = [];
  const invocations: CorsairActionInvocation[] = [];
  const openApiByPlugin: Record<string, any> = {};

  for (const meta of pluginMetas) {
    const pluginTools = tools.filter((t) => t.plugin.toLowerCase() === meta.id);
    if (pluginTools.length === 0) {
      console.log(`[corsair:dcp] No tools found for plugin '${meta.id}'; skipping.`);
      continue;
    }

    const actions: ActionSelectorCategory["actions"] = [];
    const openApiActions: Array<{ action: string; description: string; input: any }> = [];

    for (const tool of pluginTools) {
      // listOperations returns full dotted paths like "github.api.issues.list".
      // The sidecar invoke handler starts at tenant[plugin].api and then walks
      // the remaining segments, so the action we pass to the sidecar must be the
      // path after "<plugin>.api.", e.g. "issues.list". The Studio node name uses
      // the same action without the "api." prefix, e.g. "Corsair/Github/IssuesListConnector".
      const segments = tool.path.split(".");
      const action = segments.length > 2 && segments[1] === "api"
        ? segments.slice(2).join(".")
        : segments.slice(1).join(".");
      const description =
        tool.description ?? meta.actionDescriptions[action] ?? "";

      const { config, invocation } = buildActionConfig(meta, action, description, tool.input, tool.output);
      const actionSegment = config.name.split("/").pop() ?? action;
      const configPath = path.join(configRootResolved, meta.id.charAt(0).toUpperCase() + meta.id.slice(1), `${actionSegment}.json`);
      writeJson(configPath, config);

      invocations.push(invocation);
      actions.push(buildActionSelectorAction(meta, action, description));
      openApiActions.push({ action, description, input: tool.input });
    }

    categories.push(buildPluginCategory(meta, actions));

    openApiByPlugin[meta.id] = buildOpenApiSpec(meta, openApiActions);
  }

  // Write the dedicated Corsair action-selector mapping. Studio merges this
  // file at runtime instead of reading Corsair entries from the global Cloud
  // Connector mapping.
  const corsairMapping = buildCorsairMapping(categories);
  writeJson(corsairMappingFile, corsairMapping);

  // Strip any previously merged Corsair entries from the global mapping so the
  // two files never drift out of sync.
  const existingGlobal = loadExistingMapping(globalMappingFileResolved);
  const cleanedGlobal = cleanCorsairFromGlobalMapping(existingGlobal);
  writeJson(globalMappingFileResolved, cleanedGlobal);

  // Write the backend invocation map. This is the single source of truth for
  // resolving dotted sidecar actions from Studio node names.
  writeJson(actionMapFile, invocations);

  // Write the credential mapping consumed by vault credential and backend integrations.
  const integrationCatalog = buildIntegrationCatalog(pluginMetas);
  writeJson(integrationCatalogFile, integrationCatalog);
  const vaultCredentialTypeToPluginId = Object.fromEntries(
    integrationCatalog.reduce<Map<string, string>>((map, entry) => {
      if (!map.has(entry.vaultCredentialType)) map.set(entry.vaultCredentialType, entry.pluginId);
      return map;
    }, new Map()),
  );
  writeJson(vaultCredentialTypeMapFile, vaultCredentialTypeToPluginId);
  writeJson(frontendCatalogFile, integrationCatalog);
  writeMissingVaultCredentialConfigs(buildVaultCredentialConfigs(integrationCatalog));

  // Write per-plugin OpenAPI specs.
  for (const [pluginId, spec] of Object.entries(openApiByPlugin)) {
    writeJson(path.join(openApiDir, `${pluginId}.openapi.json`), spec);
  }

  console.log(
    `Generated ${categories.reduce((n, c) => n + c.actions.length, 0)} Corsair action configs across ${categories.length} categories.`,
  );
  console.log(`Configs: ${configRootResolved}`);
  console.log(`Corsair mapping: ${corsairMappingFile}`);
  console.log(`Action map: ${actionMapFile}`);
  console.log(`Integration catalog: ${integrationCatalogFile}`);
  console.log(`OpenAPI specs: ${openApiDir}`);
}
