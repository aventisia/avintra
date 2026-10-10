/**
 * Types for the hand/AI-authored Corsair node field label/description mapping.
 *
 * One mapping per plugin (not per node): field metadata is defined once and
 * reused by every node that uses the field. Optional node-level overrides let a
 * specific node reword a field, or replace the node's own (command) label and
 * description where the Corsair-provided text is poor.
 *
 * The owning plugin id is the registry key in `index.ts` (`NODE_FIELD_MAPPINGS`),
 * not a property of the mapping.
 */

/** Friendly label + description for a single field. */
export type FieldMetadata = {
  label: string;
  description: string;
};

/** Optional per-node overrides. */
export type NodeOverride = {
  /** Overrides the node's selector label (e.g. "Messages: Delete"). */
  label?: string;
  /** Overrides the node's description (the command description). */
  description?: string;
  /** Field-name -> metadata overrides, applied on top of the plugin-level fields. */
  fields?: Record<string, FieldMetadata>;
};

/** A single per-plugin node field mapping. */
export type PluginNodeFieldMapping = {
  /** Field name -> friendly metadata. Defined once and shared across all nodes. */
  fields: Record<string, FieldMetadata>;
  /** Full node name (`Corsair/<Plugin>/<Action>Connector`) -> overrides. */
  nodeOverrides?: Record<string, NodeOverride>;
};
