import { IS_TAURI } from "@avplatform/ui/constants";

import { axiosInstance } from "@avplatform/ui/lib";
import { loadJsonFromTauriResources } from "@/utils/tauri-resource-loader";

import { DCPFieldSchemaType } from "..";

const modules = {
  ...import.meta.glob("../constants/config-json/*.json"),
  ...import.meta.glob("../constants/custom-config-json/**/*.json"),
};

// In-memory cache for node configs
const nodeConfigCache: Record<string, DCPFieldSchemaType[] | undefined> = {};

/**
 * Gets the node config JSON for a given nodeUniqueName/activityName.
 * For now, loads the JSON statically from the constants/config-json folder.
 * @param nodeUniqueName The node Unique name/activity name (e.g., "WriteTextToFileActivity")
 */
export const getNodeConfig = async (
  nodeUniqueName: string,
  nodeType?: string,
) => {
  // Check cache first
  if (nodeConfigCache[nodeUniqueName]) {
    return nodeConfigCache[nodeUniqueName];
  }

  if (nodeType == "blockNode") {
    const blockConfig = JSON.parse(
      sessionStorage.getItem("block-config") || "{}",
    );
    return blockConfig[nodeUniqueName];
  }

  if (nodeUniqueName.length > 9 && nodeUniqueName.slice(-9) === "Connector") {
    // For Cloud Connectors, first attempt to load from Tauri resources (if in Tauri), then fall back to API fetch
    if (IS_TAURI) {
      try {
        return await loadJsonFromTauriResources<DCPFieldSchemaType[]>(
          `cloud-connectors/${nodeUniqueName}.json`,
        );
      } catch (error) {
        console.error(
          `Cloud Connector ${nodeUniqueName} load error from Tauri resources:`,
          error,
        );
      }
    }

    // If not in Tauri or if loading from Tauri failed, attempt to fetch from API
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

  // Get the path to the JSON file based on the nodeUniqueName
  let jsonFilepath = "";

  if (
    nodeUniqueName === "ConditionalActivity" ||
    nodeUniqueName === "ConditionalBranchActivity" ||
    nodeUniqueName === "LoopActivity"
  ) {
    jsonFilepath = `../constants/custom-config-json/${nodeUniqueName}.json`;
  } else if (nodeUniqueName.includes("AIAgent")) {
    jsonFilepath = `../constants/custom-config-json/ai-config-json/${nodeUniqueName}.json`;
  }

  // For regular desktop nodes in Tauri, load from bundled resources
  if (!jsonFilepath && IS_TAURI) {
    try {
      return await loadJsonFromTauriResources<DCPFieldSchemaType[]>(
        `desktop-nodes/${nodeUniqueName}.json`,
      );
    } catch (error) {
      console.error(
        `Config load error for ${nodeUniqueName} from Tauri resources:`,
        error,
      );
    }
  }

  // Default path for web module loading
  if (!jsonFilepath) {
    jsonFilepath = `../constants/config-json/${nodeUniqueName}.json`;
  }

  // Set the path to the JSON file
  const loader = modules[jsonFilepath];

  // Check if config file exists
  if (!loader) throw new Error(`No config found for node: ${nodeUniqueName}`);

  // Load the JSON file
  const module = (await loader()) as { default: DCPFieldSchemaType[] };

  // Return the default export of the module
  return module.default;
};
