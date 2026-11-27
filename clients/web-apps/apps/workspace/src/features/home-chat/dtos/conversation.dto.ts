/** A conversation returned by the WorkspaceAPIs ConversationController. */
export interface ConversationDto {
  /** Unique identifier of the conversation. */
  id: string;

  /** Unique identifier of the user who owns the conversation. */
  userId: string;

  /** Related flow version; null for agent-less landing conversations. */
  flowVersionId: string | null;

  /** Stored title for landing chats (empty until the first turn), else the latest message. */
  title: string;

  /** Conversation lifecycle status. */
  status: string;

  /** Whether the conversation has a live read-only share link. */
  isShared: boolean;

  /** LiteLLM provider of the model last used in this landing chat. */
  modelProvider: string | null;

  /** Model last used in this landing chat. */
  modelId: string | null;

  /** Reasoning effort last picked for this landing chat. */
  reasoningEffort: string | null;

  /** Whether web search was last enabled for this landing chat. */
  webSearch: boolean | null;
}
