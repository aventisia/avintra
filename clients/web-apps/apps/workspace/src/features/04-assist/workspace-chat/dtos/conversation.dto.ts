/** A conversation row returned by the WorkspaceAPIs ConversationController. */
export interface ConversationDto {
  /** Unique identifier of the conversation. */
  id: string;

  /** Unique identifier of the user who owns the conversation. */
  userId: string;

  /** Related flow version; null for agent-less landing conversations. */
  flowVersionId: string | null;

  /** Title derived from the most recent message. */
  title: string;

  /** Conversation lifecycle status. */
  status: string;
}
