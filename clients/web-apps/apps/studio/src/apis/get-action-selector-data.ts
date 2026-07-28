import { IS_TAURI } from "@avplatform/ui/constants";

import { axiosInstance } from "@avplatform/ui/lib";

import { PrimaryCategoryType } from "../features/action-selector/types/primary-category-type";
import { loadJsonFromTauriResources } from "../utils/tauri-resource-loader";

// Glob all JSON files in the constants folder (used in web mode)
const modules = import.meta.glob(
  "../features/action-selector/constants/*.json",
);

function mergeActionSelectorData(
  existingL1Categories: PrimaryCategoryType[],
  newL1Categories: PrimaryCategoryType[],
) {
  const mergedL1Categories: PrimaryCategoryType[] = [];

  // Loop through existing data and merge in new actionCategories from newL1Categories
  existingL1Categories.forEach((existingL1Category) => {
    // Find matching L1 category in newL1Categories by label
    const newL1Category = newL1Categories.find(
      (newL1Category) => newL1Category.label === existingL1Category.label,
    );

    if (!newL1Category) {
      // If not found in newL1Categories, push as is
      mergedL1Categories.push(existingL1Category);
    } else {
      // Merge L2 Categories (actionCategories)
      const mergedL2Categories = existingL1Category.actionCategories.map(
        (existingL2Category) => {
          // Find matching L2 category in newL1Category by label
          const newL2Category = newL1Category.actionCategories.find(
            (newL2Category) => newL2Category.label === existingL2Category.label,
          );

          if (!newL2Category) {
            // If not found in new data, return as is
            return existingL2Category;
          } else {
            // Merge L3 (actions) if both have actions
            if (existingL2Category.actions && newL2Category.actions) {
              const mergedActions = [
                ...existingL2Category.actions,
                ...newL2Category.actions.filter(
                  (newL3Action) =>
                    !existingL2Category.actions!.some(
                      (existingL3Action) =>
                        existingL3Action.name === newL3Action.name,
                    ),
                ),
              ];
              return {
                ...existingL2Category,
                actions: mergedActions,
              };
            } else if (newL2Category.actions) {
              // If only new has actions, use those
              return {
                ...existingL2Category,
                actions: newL2Category.actions,
              };
            } else {
              // Otherwise keep existing
              return existingL2Category;
            }
          }
        },
      );

      // Add new L2 categories that don't exist in existing data
      const newL2Categories = newL1Category.actionCategories.filter(
        (newL2Category) =>
          !existingL1Category.actionCategories.some(
            (existingL2Category) =>
              existingL2Category.label === newL2Category.label,
          ),
      );

      mergedL1Categories.push({
        ...existingL1Category,
        actionCategories: [...mergedL2Categories, ...newL2Categories],
      });
    }
  });

  // Add any new L1 categories from newL1Categories that don't exist in existingL1Categories
  newL1Categories.forEach((newL1Category) => {
    const existingL1Category = existingL1Categories.find(
      (category) => category.label === newL1Category.label,
    );
    if (!existingL1Category) {
      mergedL1Categories.push(newL1Category);
    }
  });

  return mergedL1Categories;
}

/**
 * Loads the action selector data from the JSON file.
 * When running in Tauri, loads from bundled resources.
 * When running in web, loads from bundled modules.
 */
export async function getActionSelectorData(): Promise<PrimaryCategoryType[]> {
  let finalNodeList: PrimaryCategoryType[];

  // Load desktop nodes
  if (IS_TAURI) {
    // Load desktop nodes mapping file from Tauri bundled resources
    finalNodeList = await loadJsonFromTauriResources<PrimaryCategoryType[]>(
      "action-selector/_ActionSelectorData.json",
    );

    // Load Cloud Connectors mapping file from Tauri bundled resources
    const cloudConnectors = await loadJsonFromTauriResources<
      PrimaryCategoryType[]
    >("action-selector/CloudConnectorActionSelectorMappingFile.json");
    if (cloudConnectors) {
      finalNodeList = mergeActionSelectorData(finalNodeList, cloudConnectors);
    }
  } else {
    // Load desktop nodes from web bundled modules
    const desktopNodesJson =
      "../features/action-selector/constants/_ActionSelectorData.json";
    const loader = modules[desktopNodesJson];
    if (!loader) throw new Error("Action selector data JSON not found");
    const desktopNodesModule = (await loader()) as {
      default: PrimaryCategoryType[];
    };
    finalNodeList = desktopNodesModule.default;

    // Fetch Cloud Connector module from remote URL using axiosInstance
    try {
      const response = await axiosInstance
        .get<
          PrimaryCategoryType[]
        >(`${import.meta.env.VITE_WORKSPACE_API_PATH}/cloud-connector/config-file/CloudConnectorActionSelectorMappingFile.json`)
        .then((res) => res.data);
      if (response) {
        finalNodeList = mergeActionSelectorData(finalNodeList, response);
      }
    } catch (error) {
      console.error("Cloud Connector mapping file fetch error:", error);
    }
  }

  // Explicitly import AI Integrations module
  const aiIntegrationsJson =
    "../features/action-selector/constants/_AIIntegrationsActionSelectorData.json";

  // Get default AI integrations automation modules
  const AIloader = modules[aiIntegrationsJson];
  if (!AIloader)
    throw new Error("Action selector data JSON not found for ai nodes");
  const aiIntegrationsModule = (await AIloader()) as {
    default: PrimaryCategoryType[];
  };

  if (aiIntegrationsModule)
    finalNodeList = mergeActionSelectorData(
      finalNodeList,
      aiIntegrationsModule.default,
    );

  // Sort finalNodeList.actionCategories by label alphabetically
  finalNodeList.forEach((category) => {
    category.actionCategories.sort((a, b) => a.label.localeCompare(b.label));
  });

  return finalNodeList;
}
