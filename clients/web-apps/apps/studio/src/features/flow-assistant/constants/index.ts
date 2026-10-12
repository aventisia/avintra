import { NodeDataType } from "@/types/node-data-type";

// IMPORTANT NOTE: The graph-generation endpoint does not exist yet; the stub
// drives the UI until the backend ships. Flip this flag when it is live.
export const FLOW_ASSISTANT_USE_STUB = true;

export const FLOW_ASSISTANT_ENDPOINT_SUFFIX = "/assist/flows/stream";

export const FLOW_ASSISTANT_PANEL_DEFAULT_SIZE = "34%";
export const FLOW_ASSISTANT_PANEL_MIN_SIZE = "24%";

const DEFAULT_AI_MODEL_INPUT = {
  key: "__ModelConfig__Inferencing",
  value: {
    is_byok_enabled: false,
    provider: "openai",
    credential_name: "",
    model: "gpt-4o-mini",
    temperature: 1,
    top_p: 1,
    max_output_tokens: null,
    reasoning_effort: "medium",
  },
};

/** Curated node catalog the stub assistant may propose. */
export const FLOW_ASSISTANT_NODE_ALLOWLIST: NodeDataType[] = [
  {
    type: "activityNode",
    name: "CreateWorkItemNode",
    label: "Create Work Item",
    description: "Creates a new work item in the specified queue.",
    img: "/assets/Queue.svg",
    supportedPlatforms: ["cloud", "windows"],
  },
  {
    type: "activityNode",
    name: "GetQueueNode",
    label: "Get Queue",
    description: "Retrieves the details of the specified queue by name.",
    img: "/assets/Queue.svg",
    supportedPlatforms: ["cloud", "windows"],
  },
  {
    type: "activityNode",
    name: "GetWorkItemByIdNode",
    label: "Get Work Item By ID",
    description: "Retrieves the details of a work item by its unique identifier.",
    img: "/assets/Queue.svg",
    supportedPlatforms: ["cloud", "windows"],
  },
  {
    type: "aiNode",
    name: "CreateInferencingAIAgent",
    label: "Text AI",
    description:
      "Performs high-speed reasoning and logic checks on incoming data to provide instant predictions.",
    img: "/assets/InferencingModel.svg",
    supportedPlatforms: ["cloud", "windows"],
    inputs: [DEFAULT_AI_MODEL_INPUT],
  },
];

export const FLOW_ASSISTANT_COPY = {
  panelTitle: "Flow Assistant",
  panelDescription: "Describe the flow you want to build or change.",
  composerPlaceholder: "e.g. Create a flow that gets a queue item and summarizes it",
  emptyState: "Ask the assistant to create or modify this agent flow.",
  applyLabel: "Apply to canvas",
  rejectLabel: "Reject",
  triggerLabel: "Flow Assistant",
} as const;
