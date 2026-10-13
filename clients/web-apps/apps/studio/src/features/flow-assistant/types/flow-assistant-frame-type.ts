type FlowAssistantDeltaFrame = { type: "delta"; output: string };

type FlowAssistantGraphProposalFrame = { type: "graph_proposal"; output: unknown };

type FlowAssistantQuestionFrame = { type: "question"; output: string };

type FlowAssistantDoneFrame = { type: "done"; output?: string };

type FlowAssistantErrorFrame = { type: "error"; message: string };

type FlowAssistantFrame =
  | FlowAssistantDeltaFrame
  | FlowAssistantGraphProposalFrame
  | FlowAssistantQuestionFrame
  | FlowAssistantDoneFrame
  | FlowAssistantErrorFrame;

export type {
  FlowAssistantDeltaFrame,
  FlowAssistantGraphProposalFrame,
  FlowAssistantQuestionFrame,
  FlowAssistantDoneFrame,
  FlowAssistantErrorFrame,
  FlowAssistantFrame,
};
