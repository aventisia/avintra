import { axiosInstance } from "@avplatform/ui/lib";

import { DCPFieldSchemaType } from "..";

const modules = {
  ...import.meta.glob("../constants/config-json/*.json"),
  ...import.meta.glob("../constants/custom-config-json/**/*.json"),
};

// In-memory cache for node configs
const nodeConfigCache: Record<string, DCPFieldSchemaType[] | undefined> = {};

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

  if (nodeType == "blockNode") {
    const blockConfig = JSON.parse(sessionStorage.getItem("block-config") || "{}");
    return blockConfig[nodeUniqueName];
  }

  if (nodeUniqueName.length > 9 && nodeUniqueName.slice(-9) === "Connector") {
    // For Cloud Connectors, fetch the config from the WorkspaceAPIs server
    try {
      const connectorConfig = await axiosInstance
        .get(
          `${import.meta.env.VITE_WORKSPACE_API_PATH}/cloud-connector/config-file/${nodeUniqueName}.json`,
        )
        .then((res) => res.data);
      if (connectorConfig) {
        // Cache the fetched config
        nodeConfigCache[nodeUniqueName] = connectorConfig;
        return connectorConfig;
      }
    } catch (error) {
      console.error(`Cloud Connector ${nodeUniqueName} fetch error:`, error);
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
