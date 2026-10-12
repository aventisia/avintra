type FlowAssistantDeltaFrame = { type: "delta"; output: string };

type FlowAssistantGraphProposalFrame = { type: "graph_proposal"; output: unknown };

type FlowAssistantDoneFrame = { type: "done"; output?: string };

type FlowAssistantErrorFrame = { type: "error"; message: string };

type FlowAssistantFrame =
  | FlowAssistantDeltaFrame
  | FlowAssistantGraphProposalFrame
  | FlowAssistantDoneFrame
  | FlowAssistantErrorFrame;

export type {
  FlowAssistantDeltaFrame,
  FlowAssistantGraphProposalFrame,
  FlowAssistantDoneFrame,
  FlowAssistantErrorFrame,
  FlowAssistantFrame,
};
