const FLOW_TYPE_LABELS: Record<string, string> = {
  Agent: "Automation agent",
  ChatAgent: "Chat agent",
};

/**
 * Maps a flow (agent) type to its friendly display label.
 * Falls back to the raw value when no override is defined.
 */
export const getFlowTypeLabel = (flowType: string | undefined): string => {
  if (!flowType) return "";
  return FLOW_TYPE_LABELS[flowType] ?? flowType;
};
