import { type ConversationMessageSenderEnum } from "../enums/conversation-message-sender.enum";

/** A persisted conversation message returned by the WorkspaceAPIs ConversationMessageController. */
export interface ConversationMessageDto {
  /** Unique identifier of the message. */
  id: string;

  /** Conversation the message belongs to. */
  conversationId: string;

  /** Related flow version; empty for landing conversations. */
  flowVersionId: string;

  /** Message content. */
  content: string;

  /** Who sent the message. */
  role: ConversationMessageSenderEnum;

  /** Structured metadata, including the UI transcript of streamed turns. */
  metadata: Record<string, unknown> | null;

  /** Attached file URLs. */
  files: string[] | null;

  /** When the message was created (ISO 8601). */
  createdOn: string;
}
