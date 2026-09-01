/**
 * Builds the dedicated Corsair action-selector mapping.
 *
 * Corsair actions are no longer merged into the global
 * CloudConnectorActionSelectorMappingFile.json. Instead, the generator emits a
 * standalone CorsairActionSelectorMappingFile.json containing the "App
 * Integrations" L1 category with all Corsair L2 categories and actions. The
 * Studio loader merges this dedicated file at runtime.
 */
import fs from "node:fs";
import type {
  ActionSelectorAction,
  ActionSelectorCategory,
  ActionSelectorPrimary,
  PluginMetadata,
} from "./types.js";
import { actionToLabel, actionToNodeName } from "./build-action-config.js";

/** The L1 category label Corsair actions live under. */
export const APP_INTEGRATIONS_LABEL = "App Integrations";

/**
 * Prefix applied to Corsair action labels and L2 category labels so they can
 * be identified as Corsair nodes in local/dev environments. These nodes are
 * not yet production-ready, so the prefix is stripped from user-facing text in
 * production (where the whole Corsair category is hidden anyway).
 */
export const CORSAIR_LABEL_PREFIX = "(Corsair) ";

/** Build a single action-selector entry for a Corsair action. */
export function buildActionSelectorAction(
  plugin: PluginMetadata,
  action: string,
  description: string,
): ActionSelectorAction {
  return {
    type: "cloudConnectorNode",
    name: actionToNodeName(plugin.id, action),
    // Label is the action name in PascalCase, space-separated.
    label: actionToLabel(action),
    description: description || actionToLabel(action),
    docsLink: "https://docs.aventisia.com",
    icon: null,
    img: plugin.img,
    supportedPlatforms: ["cloud"],
  };
}

/** Build the L2 category for a plugin from its actions. */
export function buildPluginCategory(
  plugin: PluginMetadata,
  actions: ActionSelectorAction[],
): ActionSelectorCategory {
  return {
    // TODO: Remove the Corsair label prefix once the nodes are production-ready.
    label: `${CORSAIR_LABEL_PREFIX}${plugin.providerName}`,
    // Remove internal "Corsair" branding from user-facing description.
    // This ensures users only see the integration provider name, not the
    // backend infrastructure used to power it.
    description: plugin.description.replace(/\s*plugin for Corsair\s*/i, "").trim() || plugin.providerName,
    icon: null,
    img: plugin.img,
    listType: null,
    actions,
    // Corsair nodes are not production-ready yet — hide them in production.
    doNotRenderIf: ["production"],
  };
}

/**
 * Build the dedicated Corsair action-selector mapping.
 * Returns a single L1 category ("App Integrations") containing all Corsair
 * plugins as L2 categories.
 */
export function buildCorsairMapping(
  generatedCategories: ActionSelectorCategory[],
): ActionSelectorPrimary[] {
  return [
    {
      label: APP_INTEGRATIONS_LABEL,
      description: "Seamlessly integrate with apps and services such as Twilio, Slack, and more",
      icon: "AppIntegrationsIcon",
      img: null,
      actionCategories: generatedCategories,
    },
  ];
}

/** Load the existing mapping file, or return an empty list if absent. */
export function loadExistingMapping(filePath: string): ActionSelectorPrimary[] {
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as ActionSelectorPrimary[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Remove Corsair-generated entries from the global Cloud Connector action
 * selector mapping. Targets entries whose actions start with "Corsair/" to
 * avoid accidentally removing legitimate manual categories.
 */
export function cleanCorsairFromGlobalMapping(
  existing: ActionSelectorPrimary[],
): ActionSelectorPrimary[] {
  return existing.map((l1) => ({
    ...l1,
    actionCategories: l1.actionCategories
      .map((l2) => {
        if (l2.actions && l2.actions.length > 0) {
          // Check if this category contains any Corsair-generated actions.
          const hasCorsairActions = l2.actions.some((a) => a.name.startsWith("Corsair/"));
          if (hasCorsairActions) {
            // Remove only Corsair actions; keep native ones (e.g., native Twilio).
            const filtered = l2.actions.filter((a) => !a.name.startsWith("Corsair/"));
            if (filtered.length === 0) {
              // If no actions remain, remove the entire category.
              return null;
            }
            return {
              ...l2,
              actions: filtered,
            };
          }
        }
        return l2;
      })
      .filter(Boolean) as ActionSelectorCategory[],
  }));
}
