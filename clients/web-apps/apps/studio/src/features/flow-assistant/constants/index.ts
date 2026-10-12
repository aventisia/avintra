// IMPORTANT NOTE: Set to true to use the deterministic local stub instead of the
// WorkspaceAPIs /assist/flows/stream endpoint.
export const FLOW_ASSISTANT_USE_STUB = false;

export const FLOW_ASSISTANT_ENDPOINT_SUFFIX = "/assist/flows/stream";

export const FLOW_ASSISTANT_PANEL_DEFAULT_SIZE = "34%";
export const FLOW_ASSISTANT_PANEL_MIN_SIZE = "24%";

export { FLOW_ASSISTANT_NODE_ALLOWLIST } from "../generated/flow-assistant-catalog";

export const FLOW_ASSISTANT_COPY = {
  panelTitle: "Flow Assistant",
  panelDescription: "Describe the flow you want to build or change.",
  composerPlaceholder: "e.g. Create a flow that gets a queue item and summarizes it",
  emptyState: "Ask the assistant to create or modify this agent flow.",
  applyLabel: "Apply to canvas",
  rejectLabel: "Reject",
  triggerLabel: "Flow Assistant",
} as const;
