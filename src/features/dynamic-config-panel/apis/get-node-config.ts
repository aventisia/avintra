import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { DCPFieldSchemaType } from "..";
import { generateOutputConfigFromData } from "../utils/generate-ai-config";

const modules = {
  ...import.meta.glob("../constants/config-json/*.json"),
  ...import.meta.glob("../constants/custom-config-json/*.json"),
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

  if (nodeUniqueName == "AIModel") {
    return (await generateOutputConfigFromData()) as DCPFieldSchemaType[];
  }

  if (nodeUniqueName.length > 9 && nodeUniqueName.slice(-9) === "Connector") {
    try {
      const connectorConfig = await axiosInstance
        .get(`${import.meta.env.VITE_WORC_API_URL}/cloud-connector/config-file/${nodeUniqueName}.json`)
        .then((res) => res.data);
      if (connectorConfig) {
        const connectorFields = connectorConfig.fields as DCPFieldSchemaType[];
        // Cache the fetched config
        nodeConfigCache[nodeUniqueName] = connectorFields;
        return connectorFields;
      }
    } catch (error) {
      console.error(`Cloud Connector ${nodeUniqueName} fetch error:`, error);
    }
  }

  // Get the path to the JSON file based on the nodeUniqueName
  let path = `../constants/config-json/${nodeUniqueName}.json`;

  if (
    nodeUniqueName === "ConditionalActivity" ||
    nodeUniqueName === "ConditionalBranchActivity" ||
    nodeUniqueName === "LoopActivity"
  ) {
    path = `../constants/custom-config-json/${nodeUniqueName}.json`;
  }

  // Set the path to the JSON file
  const loader = modules[path];

  // Check if config file exists
  if (!loader) throw new Error(`No config found for node: ${nodeUniqueName}`);

  // Load the JSON file
  const module = (await loader()) as { default: DCPFieldSchemaType[] };

  // Return the default export of the module
  return module.default;
};
