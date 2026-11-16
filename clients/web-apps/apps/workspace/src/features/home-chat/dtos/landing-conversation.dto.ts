/** A Home conversation as listed in the chat history. */
export interface LandingConversationDto {
  /** Unique identifier of the conversation. */
  id: string;

  /** Title taken from the first message, or the name the user gave it. */
  title: string;

  /** ISO timestamp of the conversation's last change; orders the history. */
  lastModifiedOn: string;

  /** Whether the chat is pinned above the rest of the history. */
  isPinned: boolean;

  /** The project the chat is filed under, or null when ungrouped. */
  projectId: string | null;
}
