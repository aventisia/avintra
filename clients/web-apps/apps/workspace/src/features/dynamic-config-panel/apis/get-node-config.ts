import { DCPFieldSchemaType } from "..";

const modules = {
  ...import.meta.glob("../constants/config-json/*.json"),
};

/**
 * Gets the node config JSON for a given nodeUniqueName/activityName.
 * For now, loads the JSON statically from the constants/config-json folder.
 * @param nodeUniqueName The node Unique name/activity name (e.g., "WriteTextToFileActivity")
 */
export const getNodeConfig = async (nodeUniqueName: string) => {
  // Get the path to the JSON file based on the nodeUniqueName
  const path = `../constants/config-json/${nodeUniqueName}.json`;

  // Set the path to the JSON file
  const loader = modules[path];

  // Check if config file exists
  if (!loader) throw new Error(`No config found for node: ${nodeUniqueName}`);

  // Load the JSON file
  const module = (await loader()) as { default: DCPFieldSchemaType[] };

  // Return the default export of the module
  return module.default;
};
