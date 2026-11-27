type AgentStatus = { status?: string };

export const isAgentRunning = (agent: AgentStatus) => agent.status?.toLowerCase() === "running";

/** Status of the machine hosting the agent, capitalized; "Offline" when unknown. */
export const getAgentStatusLabel = ({ status }: AgentStatus) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : "Offline";
