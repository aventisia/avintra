import { FlowTypesEnum } from "@avplatform/ui/enums";

/**
 * The unique key for the flowVersions query to be used in the query client. ["flowVersions"]
 */
const DATA_QUERY_KEY = ["flowVersions"];

const AGENT_DETAILS_PANEL_ID = "agent-details";

const FLOW_TYPE_LABELS: Record<FlowTypesEnum, string> = {
  [FlowTypesEnum.Agent]: "Automation agent",
  [FlowTypesEnum.ChatAgent]: "Chat agent",
  [FlowTypesEnum.Block]: "Block",
};

export { AGENT_DETAILS_PANEL_ID, DATA_QUERY_KEY, FLOW_TYPE_LABELS };
