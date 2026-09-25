export type ChatAgentPromptRequestDto = {
  /** Credit source type; ChatAgent prompt generation is billed under Agent. */
  refType: "Agent";
  /** Selects the ChatAgent system-prompt template on the backend. */
  promptTarget: "ChatAgentSystemPrompt";
  /** Flow version id used as the generation reference. */
  refId: string;
  /** Flow name used as the generation reference. */
  refName: string;
  /** Current system prompt text; may be empty to request a generated sample. */
  payload: string;
};
