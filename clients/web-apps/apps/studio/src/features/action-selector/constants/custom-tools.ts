import { PrimaryCategoryType } from "../types/primary-category-type";

/**
 * Client-side L1 label for the Custom Tools section in the action selector.
 *
 * The backend-served CloudConnectorActionSelectorMappingFile.json still ships a
 * disabled "Custom Nodes" placeholder L1; `getActionSelectorData()` filters that
 * placeholder out and injects this enabled "Custom Tools" category instead.
 */
export const CUSTOM_TOOLS_L1_LABEL = "Custom Tools";

/** Label of the legacy backend placeholder L1 that this client replaces. */
const LEGACY_CUSTOM_NODES_LABEL = "Custom Nodes";

/** Icon key — reuses the existing CustomNodesIcon (puzzle) entry in icon-mapper. */
const CUSTOM_TOOLS_ICON_KEY = "CustomNodesIcon";

/** The single L2 shown inside the Custom Tools section (rendered as an empty state). */
export const CUSTOM_TOOLS_L2_LABEL = "Manage Custom Tools";

/**
 * Builds the client-defined "Custom Tools" L1 category.
 */
export function buildCustomToolsPrimaryCategory(): PrimaryCategoryType {
  return {
    label: CUSTOM_TOOLS_L1_LABEL,
    description: "Create and use custom tools to extend your agents beyond the built-in set",
    icon: CUSTOM_TOOLS_ICON_KEY,
    actionCategories: [
      {
        label: CUSTOM_TOOLS_L2_LABEL,
        description: "Custom tools available to your agents",
        icon: CUSTOM_TOOLS_ICON_KEY,
        actions: [],
      },
    ],
  };
}

/**
 * Replaces the backend "Custom Nodes" placeholder L1 with the client-defined,
 * enabled "Custom Tools" L1.
 *
 * Matching is tolerant: it removes the legacy "Custom Nodes" label and any
 * pre-existing "Custom Tools" entry (idempotent), so the injected category is
 * always present exactly once and never inherits the placeholder's
 * `disabled: true` state via the label-based merge.
 */
export function applyCustomToolsL1(categories: PrimaryCategoryType[]): PrimaryCategoryType[] {
  const withoutPlaceholder = categories.filter(
    (category) =>
      category.label !== LEGACY_CUSTOM_NODES_LABEL && category.label !== CUSTOM_TOOLS_L1_LABEL,
  );
  return [...withoutPlaceholder, buildCustomToolsPrimaryCategory()];
}