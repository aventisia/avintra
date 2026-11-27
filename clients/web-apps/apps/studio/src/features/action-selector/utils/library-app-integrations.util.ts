import { PrimaryCategoryType } from "../types/primary-category-type";

// IMPORTANT NOTE: these mirror the Corsair DCP generator (build-mapping.ts,
// build-action-config.ts); renaming either there silently disables this filter.
const APP_INTEGRATIONS_L1_LABEL = "App Integrations";

const CORSAIR_ACTION_NAME_PREFIX = "Corsair/";

/**
 * Keeps the built-in App Integrations categories and only the library integrations the tenant has switched on.
 */
export function filterLibraryAppIntegrations(
  categories: PrimaryCategoryType[],
  enabledLibraryToolNames: Iterable<string>,
): PrimaryCategoryType[] {
  const enabledNames = new Set(
    [...enabledLibraryToolNames].map((name) => name.trim().toLowerCase()),
  );

  return categories.map((primary) => {
    if (primary.label !== APP_INTEGRATIONS_L1_LABEL) return primary;

    return {
      ...primary,
      actionCategories: primary.actionCategories
        .map((actionCategory) => {
          const label = actionCategory.label.trim().toLowerCase();

          return {
            ...actionCategory,
            actions: actionCategory.actions?.filter(
              (action) =>
                !action.name.startsWith(CORSAIR_ACTION_NAME_PREFIX) || enabledNames.has(label),
            ),
          };
        })
        .filter((actionCategory) => actionCategory.actions?.length),
    };
  });
}
