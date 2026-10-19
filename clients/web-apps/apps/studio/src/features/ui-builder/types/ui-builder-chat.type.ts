/** Progress of one step in an agentic builder turn. */
export type UiBuilderChatStepStatus = "pending" | "running" | "done" | "error" | "skipped";

/** One step shown in an assistant turn's timeline. */
export type UiBuilderChatStep = {
  id: string;
  label: string;
  status: UiBuilderChatStepStatus;
  detail?: string;
};

/** A single turn rendered in the builder's chat transcript. */
export type UiBuilderChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  status?: "streaming" | "error";
  steps?: UiBuilderChatStep[];
  /** Model label shown under an assistant turn. */
  model?: string;
  /** Selector the user prompt targeted, when it was scoped to one element. */
  selector?: string;
};
