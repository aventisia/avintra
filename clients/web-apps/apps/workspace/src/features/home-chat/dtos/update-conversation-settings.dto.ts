/** Remembers the model, effort and web search of a landing conversation. */
export interface UpdateConversationSettingsDto {
  /** Unique identifier of the conversation. */
  id: string;

  /** LiteLLM provider of the model. */
  modelProvider: string | null;

  /** Model. */
  modelId: string | null;

  /** Reasoning effort, or null for the model's default. */
  reasoningEffort: string | null;

  /** Whether web search is enabled. */
  webSearch: boolean | null;
}
