/** Pins or unpins a Home conversation. */
export interface UpdateConversationPinDto {
  /** Unique identifier of the conversation. */
  id: string;

  /** Whether the conversation is pinned. */
  isPinned: boolean;
}
