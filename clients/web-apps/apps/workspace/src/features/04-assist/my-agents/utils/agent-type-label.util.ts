/**
 * Maps the backend agent (flow) type to a friendly display label.
 * Agent -> "Automation agent", ChatAgent -> "Chat agent", VoiceAgent -> "Voice agent".
 */
export const getAgentTypeLabel = (agentType: string | undefined): string | undefined => {
  switch (agentType) {
    case "Agent":
      return "Automation agent";
    case "ChatAgent":
      return "Chat agent";
    case "VoiceAgent":
      return "Voice agent";
    default:
      return agentType;
  }
};
