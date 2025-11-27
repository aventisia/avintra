import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { PrimaryCategoryType } from "../features/action-selector/types/primary-category-type";

// Glob all JSON files in the constants folder
const modules = import.meta.glob(
  "../features/action-selector/constants/*.json",
);

function mergeActionSelectorData(
  existingData: PrimaryCategoryType[],
  newData: PrimaryCategoryType[],
) {
  const mergedData: PrimaryCategoryType[] = [];

  // Loop through existing data and merge in new actionCategories from newData
  existingData.forEach((existingCategory) => {
    // Find matching category in newData
    const newDataCategory = newData.find(
      (category) => category.label === existingCategory.label,
    );

    if (!newDataCategory) {
      // If not found in newData, push as is
      mergedData.push(existingCategory);
    } else {
      // Merge: keep all existing actionCategories, add only new ones from newData
      const mergedActionCategories = [
        ...existingCategory.actionCategories,
        ...newDataCategory.actionCategories.filter(
          (newActionCat) =>
            !existingCategory.actionCategories.some(
              (existingActionCat) =>
                existingActionCat.label === newActionCat.label,
            ),
        ),
      ];
      mergedData.push({
        ...existingCategory,
        actionCategories: mergedActionCategories,
      });
    }
  });

  // Add any new top-level categories from newData that don't exist in existingData
  newData.forEach((newCategory) => {
    const existingCategory = existingData.find(
      (category) => category.label === newCategory.label,
    );
    if (!existingCategory) {
      mergedData.push(newCategory);
    }
  });

  return mergedData;
}

/**
 * Loads the action selector data from the JSON file in src.
 */
export async function getActionSelectorData(): Promise<PrimaryCategoryType[]> {
  let desktopNodesJson =
    "../features/action-selector/constants/_ActionSelectorData.json";

  // Use dev data in non-production environments
  if (import.meta.env.MODE !== "production") {
    desktopNodesJson =
      "../features/action-selector/constants/_DevActionSelectorData.json";
  }

  // Get default Desktop automation modules
  const loader = modules[desktopNodesJson];
  if (!loader) throw new Error("Action selector data JSON not found");
  const desktopNodesModule = (await loader()) as {
    default: PrimaryCategoryType[];
  };
  let finalNodeList: PrimaryCategoryType[] = desktopNodesModule.default;

  // Fetch Cloud Connector module from remote URL using axiosInstance
  try {
    const response = await axiosInstance
      .get<
        PrimaryCategoryType[]
      >(`${import.meta.env.VITE_WORC_API_URL}/cloud-connector/config-file/CloudConnectorActionSelectorMappingFile.json`)
      .then((res) => res.data);
    if (response) {
      finalNodeList = mergeActionSelectorData(finalNodeList, response);
    }
  } catch (error) {
    console.error("Cloud Connector mapping file fetch error:", error);
  }

  // Explicitly import AI Integrations module
  const aiIntegrationsModule = (await import(
    "../features/action-selector/constants/_AIIntegrationsActionSelectorData.json"
  )) as unknown as { default: PrimaryCategoryType[] };
  finalNodeList = mergeActionSelectorData(
    finalNodeList,
    aiIntegrationsModule.default,
  );

  return finalNodeList;
}
