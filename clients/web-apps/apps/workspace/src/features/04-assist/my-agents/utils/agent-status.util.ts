import { AgentsAssistDto } from "../dtos/agent-assist-dto";

export const isAgentRunning = (agent: Pick<AgentsAssistDto, "status">) =>
  agent.status?.toLowerCase() === "running";

/** Status of the machine hosting the agent, capitalized; "Offline" when unknown. */
export const getAgentStatusLabel = ({ status }: Pick<AgentsAssistDto, "status">) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : "Offline";
