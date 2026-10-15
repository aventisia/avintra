/**
 * Maps the backend agent (flow) type to a friendly display label.
 * Agent -> "Automation Agent", ChatAgent -> "Chat Agent", VoiceAgent -> "Voice Agent".
 */
export const getAgentTypeLabel = (agentType: string | undefined): string | undefined => {
  switch (agentType) {
    case "Agent":
      return "Automation Agent";
    case "ChatAgent":
      return "Chat Agent";
    case "VoiceAgent":
      return "Voice Agent";
    default:
      return agentType;
  }
};
