import {
  FLOW_ASSISTANT_CONFIG_METADATA,
  FlowAssistantConfigField,
  FlowAssistantNodeConfigMetadata,
} from "../generated/flow-assistant-config-metadata";

/** Resolves the fillable configuration metadata for a node, or null when the node has none. */
export const findNodeConfigMetadata = (
  type: string,
  name?: string,
): FlowAssistantNodeConfigMetadata | null =>
  FLOW_ASSISTANT_CONFIG_METADATA.find((entry) => entry.type === type && entry.name === name) ??
  null;

/** Whether a field stores a numeric value. */
export const isNumberField = (field: FlowAssistantConfigField): boolean =>
  field.type === "number" || field.type === "slider";

/** Whether a field stores a boolean value. */
export const isBooleanField = (field: FlowAssistantConfigField): boolean =>
  field.type === "switch" || field.type === "checkbox";
