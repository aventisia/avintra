import { axiosInstance } from "@avplatform/ui/lib";

import { PrimaryCategoryType } from "../features/action-selector/types/primary-category-type";
import { applyCustomToolsL1 } from "../features/action-selector/utils/custom-tool-actions.util";

const modules = import.meta.glob("../features/action-selector/constants/*.json");

function mergeActionSelectorData(
  existingL1Categories: PrimaryCategoryType[],
  newL1Categories: PrimaryCategoryType[],
) {
  const mergedL1Categories: PrimaryCategoryType[] = [];

  existingL1Categories.forEach((existingL1Category) => {
    const newL1Category = newL1Categories.find(
      (newL1Category) => newL1Category.label === existingL1Category.label,
    );

    if (!newL1Category) {
      mergedL1Categories.push(existingL1Category);
    } else {
      const mergedL2Categories = existingL1Category.actionCategories.map((existingL2Category) => {
        const newL2Category = newL1Category.actionCategories.find(
          (newL2Category) => newL2Category.label === existingL2Category.label,
        );

        if (!newL2Category) {
          return existingL2Category;
        } else {
          if (existingL2Category.actions && newL2Category.actions) {
            const mergedActions = [
              ...existingL2Category.actions,
              ...newL2Category.actions.filter(
                (newL3Action) =>
                  !existingL2Category.actions!.some(
                    (existingL3Action) => existingL3Action.name === newL3Action.name,
                  ),
              ),
            ];
            return {
              ...existingL2Category,
              actions: mergedActions,
            };
          } else if (newL2Category.actions) {
            return {
              ...existingL2Category,
              actions: newL2Category.actions,
            };
          } else {
            return existingL2Category;
          }
        }
      });

      const newL2Categories = newL1Category.actionCategories.filter(
        (newL2Category) =>
          !existingL1Category.actionCategories.some(
            (existingL2Category) => existingL2Category.label === newL2Category.label,
          ),
      );

      mergedL1Categories.push({
        ...existingL1Category,
        actionCategories: [...mergedL2Categories, ...newL2Categories],
      });
    }
  });

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
 * Loads the action selector data from bundled JSON and the Workspace API.
 */
export async function getActionSelectorData(): Promise<PrimaryCategoryType[]> {
  let finalNodeList: PrimaryCategoryType[];

  const desktopNodesJson = "../features/action-selector/constants/_ActionSelectorData.json";
  const loader = modules[desktopNodesJson];
  if (!loader) throw new Error("Action selector data JSON not found");
  const desktopNodesModule = (await loader()) as {
    default: PrimaryCategoryType[];
  };
  finalNodeList = desktopNodesModule.default;

  try {
    const response = await axiosInstance
      .get<PrimaryCategoryType[]>(
        `${import.meta.env.VITE_WORKSPACE_API_PATH}/cloud-connector/config-file/CloudConnectorActionSelectorMappingFile.json`,
      )
      .then((res) => res.data);
    if (response) {
      finalNodeList = mergeActionSelectorData(finalNodeList, response);
    }
  } catch (error) {
    console.error("Cloud Connector mapping file fetch error:", error);
  }

  try {
    const corsairResponse = await axiosInstance
      .get<PrimaryCategoryType[]>(
        `${import.meta.env.VITE_WORKSPACE_API_PATH}/cloud-connector/config-file/CorsairActionSelectorMappingFile.json`,
      )
      .then((res) => res.data);
    if (corsairResponse) {
      finalNodeList = mergeActionSelectorData(finalNodeList, corsairResponse);
    }
  } catch (error) {
    console.error("Corsair action selector mapping file fetch error:", error);
  }

  const aiIntegrationsJson =
    "../features/action-selector/constants/_AIIntegrationsActionSelectorData.json";

  const AIloader = modules[aiIntegrationsJson];
  if (!AIloader) throw new Error("Action selector data JSON not found for ai nodes");
  const aiIntegrationsModule = (await AIloader()) as {
    default: PrimaryCategoryType[];
  };

  if (aiIntegrationsModule)
    finalNodeList = mergeActionSelectorData(finalNodeList, aiIntegrationsModule.default);

  finalNodeList = applyCustomToolsL1(finalNodeList);

  finalNodeList.forEach((category) => {
    category.actionCategories.sort((a, b) => a.label.localeCompare(b.label));
  });

  return finalNodeList;
}
