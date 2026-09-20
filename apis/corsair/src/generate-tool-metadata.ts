/**
 * Shared Corsair tool metadata generation.
 *
 * This module generates tool metadata from the Corsair plugin registry.
 * Used by both the config file generator and the tool seeder.
 *
 * Avoids duplication and ensures metadata stays in sync across both paths.
 */
import { listOperations, getStructuredSchema } from "corsair";
import type { PluginMetadata } from "./dcp-generator/types.js";
import { toPluginMetadataList } from "./dcp-generator/plugin-metadata.js";
import { buildOpenApiSpec } from "./dcp-generator/build-openapi.js";
import { DEFAULT_ICON_MAP } from "./dcp-generator/plugin-metadata.js";

export interface GeneratedToolMetadata {
  id: string;
  pluginId: string;
  name: string;
  description: string;
  openApiSpec: string;
}

/** A tool descriptor derived from the corsair instance in-process. */
interface CorsairTool {
  path: string;
  plugin: string;
  description?: string;
  input: any;
  output: any;
}

/**
 * Introspect the corsair instance to build the tool list.
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

/**
 * Generate tool metadata from registered Corsair plugins.
 *
 * @param plugins Corsair plugin instances
 * @param corsair Corsair instance for schema introspection
 * @param iconMap Optional icon URL map per plugin
 * @returns Array of generated tool metadata
 */
export async function generateToolMetadata(
  plugins: readonly unknown[],
  corsair: unknown,
  iconMap = DEFAULT_ICON_MAP,
): Promise<GeneratedToolMetadata[]> {
  if (!corsair) {
    throw new Error("generateToolMetadata requires a corsair instance to introspect schemas.");
  }

  const pluginMetas = toPluginMetadataList(plugins as any, iconMap);
  const tools = listTools(corsair);
  const generatedTools: GeneratedToolMetadata[] = [];

  for (const meta of pluginMetas) {
    const pluginTools = tools.filter((t) => t.plugin.toLowerCase() === meta.id);
    if (pluginTools.length === 0) {
      console.log(`[corsair:metadata] No tools found for plugin '${meta.id}'; skipping.`);
      continue;
    }

    const openApiActions = pluginTools.map((tool) => {
      const segments = tool.path.split(".");
      const action = segments.length > 2 && segments[1] === "api"
        ? segments.slice(2).join(".")
        : segments.slice(1).join(".");
      const description =
        tool.description ?? meta.actionDescriptions[action] ?? "";
      return { action, description, input: tool.input };
    });

    const openApiSpec = buildOpenApiSpec(meta, openApiActions);

    generatedTools.push({
      id: meta.id,
      pluginId: meta.id,
      name: meta.providerName,
      description: `${meta.providerName} connector`,
      openApiSpec: JSON.stringify(openApiSpec),
    });
  }

  return generatedTools;
}
