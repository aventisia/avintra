/** Renames a Home conversation. */
export interface UpdateConversationTitleDto {
  /** Unique identifier of the conversation. */
  id: string;

  /** New title, at most 200 characters. */
  title: string;
}
