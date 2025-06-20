import { PrimaryCategoryType } from "../features/action-selector/types/primary-category-type";

// Glob all JSON files in the constants folder
const modules = import.meta.glob(
  "../features/action-selector/constants/_ActionSelectorData.json",
);

/**
 * Loads the action selector data from the JSON file in src.
 */
export async function getActionSelectorData(): Promise<PrimaryCategoryType[]> {
  const path = "../features/action-selector/constants/_ActionSelectorData.json";

  const loader = modules[path];

  if (!loader) throw new Error("Action selector data JSON not found");

  const module = (await loader()) as { default: PrimaryCategoryType[] };
  let data = module.default;

  if (import.meta.env.MODE !== "production") {
    // Explicit import of dev data
    const devModule = (await import(
      "../features/action-selector/constants/_DevActionSelectorData.json"
    )) as unknown as { default: PrimaryCategoryType[] };

    data = [...data, ...devModule.default];
  }

  return data;
}
