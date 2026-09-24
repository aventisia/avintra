import { axiosInstance } from "@avplatform/ui/lib";

import { DCPFieldSchemaType } from "..";

const modules = {
  ...import.meta.glob("../constants/config-json/*.json"),
  ...import.meta.glob("../constants/custom-config-json/**/*.json"),
};

// In-memory cache for node configs. Values are the resolved config arrays;
// promises are stored separately while a fetch is in flight so concurrent
// callers for the same node share a single request instead of duplicating it.
const nodeConfigCache: Record<string, DCPFieldSchemaType[] | undefined> = {};
const nodeConfigInFlight: Record<string, Promise<DCPFieldSchemaType[] | unknown> | undefined> = {};

/**
 * Node-name prefix identifying a custom-tool action node (see
 * getCustomToolNodeName in the action-selector converters).
 */
const CUSTOM_TOOL_NODE_PREFIX = "CustomTool/";

/**
 * Detects a custom-tool action node name: the "CustomTool/" keyword prefix
 * followed by "{toolName}.{operationId}" (e.g. "CustomTool/Weather API.get_user").
 * Legacy fallback: flows saved before the tool-name convention use the bare
 * "{toolId}.{operationId}" form, so a leading GUID is still accepted.
 */
const isCustomToolNodeName = (nodeUniqueName: string): boolean => {
  if (nodeUniqueName.startsWith(CUSTOM_TOOL_NODE_PREFIX)) return true;

  const separatorIndex = nodeUniqueName.lastIndexOf(".");
  if (separatorIndex <= 0) return false;
  const toolRef = nodeUniqueName.slice(0, separatorIndex);
  const operationId = nodeUniqueName.slice(separatorIndex + 1);
  const guidPattern =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return guidPattern.test(toolRef) && operationId.length > 0;
};

/**
 * Computes the static JSON file path for a given node unique name.
 * Keeps the existing routing logic for special/custom folders.
 */
const getJsonFilepath = (nodeUniqueName: string): string => {
  if (
    nodeUniqueName === "ConditionalActivity" ||
    nodeUniqueName === "ConditionalBranchActivity" ||
    nodeUniqueName === "LoopActivity"
  ) {
    return `../constants/custom-config-json/${nodeUniqueName}.json`;
  }

  if (nodeUniqueName.includes("AIAgent")) {
    return `../constants/custom-config-json/ai-config-json/${nodeUniqueName}.json`;
  }

  return `../constants/config-json/${nodeUniqueName}.json`;
};

/**
 * Gets the node config JSON for a given nodeUniqueName/activityName.
 * For now, loads the JSON statically from the constants/config-json folder.
 * @param nodeUniqueName The node Unique name/activity name (e.g., "WriteTextToFileActivity")
 */
export const getNodeConfig = async (nodeUniqueName: string, nodeType?: string) => {
  // Check cache first
  if (nodeConfigCache[nodeUniqueName]) {
    return nodeConfigCache[nodeUniqueName];
  }

  // Join an in-flight fetch for the same node instead of issuing a duplicate
  // request (the DCP form mount and other consumers can race on first render).
  if (nodeConfigInFlight[nodeUniqueName] !== undefined) {
    return nodeConfigInFlight[nodeUniqueName];
  }

  if (nodeType == "blockNode") {
    const blockConfig = JSON.parse(sessionStorage.getItem("block-config") || "{}");
    return blockConfig[nodeUniqueName];
  }

  if (nodeUniqueName.length > 9 && nodeUniqueName.slice(-9) === "Connector") {
    // For Cloud Connectors (including Corsair connectors, which are named
    // "Corsair/{Plugin}/{Action}Connector"), fetch the config from the
    // WorkspaceAPIs server.
    const connectorFetch = axiosInstance
      .get(
        `${import.meta.env.VITE_WORKSPACE_API_PATH}/cloud-connector/config-file/${nodeUniqueName}.json`,
      )
      .then((res) => res.data);
    nodeConfigInFlight[nodeUniqueName] = connectorFetch;
    try {
      const connectorConfig = await connectorFetch;
      if (connectorConfig) {
        // Cache the fetched config
        nodeConfigCache[nodeUniqueName] = connectorConfig;
        return connectorConfig;
      }
    } catch (error) {
      console.error(`Cloud Connector ${nodeUniqueName} fetch error:`, error);
    } finally {
      delete nodeConfigInFlight[nodeUniqueName];
    }
  }

  if (isCustomToolNodeName(nodeUniqueName)) {
    // Custom-tool action nodes ("CustomTool/{toolName}.{operationId}") have no
    // static config JSON; their form schema is generated on the server from the
    // tool's OpenAPI spec (parameters, request body, responses).
    const customToolFetch = axiosInstance
      .get(`${import.meta.env.VITE_WORKSPACE_API_PATH}/tools/node-config/${nodeUniqueName}.json`)
      .then((res) => res.data);
    nodeConfigInFlight[nodeUniqueName] = customToolFetch;
    try {
      const customToolConfig = await customToolFetch;
      if (customToolConfig) {
        nodeConfigCache[nodeUniqueName] = customToolConfig;
        return customToolConfig;
      }
    } catch (error) {
      console.error(`Custom tool node ${nodeUniqueName} config fetch error:`, error);
    } finally {
      delete nodeConfigInFlight[nodeUniqueName];
    }
  }

  // Try the original nodeUniqueName first
  const namesToTry = [nodeUniqueName];

  // TODO: Remove this fallback once all legacy flows using the "Activity"
  // suffix have been migrated to the "Node" suffix.
  // Fallback: some legacy nodes were saved with an "Activity" suffix,
  // but their config files have been renamed with a "Node" suffix.
  if (nodeUniqueName.endsWith("Activity")) {
    namesToTry.push(`${nodeUniqueName.slice(0, -"Activity".length)}Node`);
  }

  for (const name of namesToTry) {
    const jsonFilepath = getJsonFilepath(name);
    const loader = modules[jsonFilepath];

    if (loader) {
      const module = (await loader()) as { default: DCPFieldSchemaType[] };
      // Cache under the requested name so subsequent lookups are fast
      nodeConfigCache[nodeUniqueName] = module.default;
      return module.default;
    }
  }

  throw new Error(`No config found for node: ${nodeUniqueName}`);
};
