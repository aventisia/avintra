/**
 * Registry of hand/AI-authored Corsair node field label/description mappings.
 *
 * One mapping per plugin. Plugins without a mapping fall back to the existing
 * generator behavior (Corsair structured-schema descriptions + humanized keys).
 */
import type { PluginNodeFieldMapping } from "./types.js";
import { gmailNodeFieldMapping } from "./gmail.js";

const NODE_FIELD_MAPPINGS: Record<string, PluginNodeFieldMapping> = {
  gmail: gmailNodeFieldMapping,
};

/** Resolve the node field mapping for a plugin id, if one has been authored. */
export function getNodeFieldMapping(pluginId: string): PluginNodeFieldMapping | undefined {
  return NODE_FIELD_MAPPINGS[pluginId];
}
