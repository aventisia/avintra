export type VoiceAgentPromptRequestDto = {
  /** Credit source type; voice prompt generation is billed under Agent. */
  refType: "Agent";
  /** Selects the voice system-prompt template on the backend. */
  promptTarget: "VoiceAgentSystemPrompt";
  /** Flow version id used as the generation reference. */
  refId: string;
  /** Flow name used as the generation reference. */
  refName: string;
  /** Concatenated Goal/Role/Instructions text; empty to request generated sections. */
  payload: string;
};
