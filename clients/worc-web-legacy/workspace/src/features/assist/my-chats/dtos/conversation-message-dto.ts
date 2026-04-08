// enums
export enum ConversationMessageSenderEnum {
  USER = "User",
  ASSISTANT = "Assistant",
  SYSTEM = "System",
}

// DTO
export interface ConversationMessageDto {
  /** Unique identifier of the message */
  id: string; // Guid → string

  /** Conversation ID this message belongs to */
  conversationId: string;

  /** Related flow version ID */
  flowVersionId: string;

  /** Message content */
  content: string;

  /** Sender role */
  role: ConversationMessageSenderEnum;

  /** Additional structured metadata (JSON) */
  metadata?: Record<string, unknown> | null;

  /** Associated file URLs */
  files?: string[] | null;

  /** Created timestamp (ISO string) */
  createdOn: Date | string; // DateTimeOffset → ISO string
}
