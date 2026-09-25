/**
 * Maps the backend agent (flow) type to a friendly display label.
 * Agent -> "Automation Agent", ChatAgent -> "Chat Agent".
 */
export const getAgentTypeLabel = (agentType: string | undefined): string | undefined => {
  switch (agentType) {
    case "Agent":
      return "Automation Agent";
    case "ChatAgent":
      return "Chat Agent";
    default:
      return agentType;
  }
};
