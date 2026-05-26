import { ConversationStatusEnum } from "../enums/conversation-status-enum";

export interface ConversationSummaryDto {
  /** Unique identifier of the conversation */
  id: string; // Guid → string

  /**
   * Conversation title (first 5 words of latest message or fallback)
   * Defaults handled by backend
   */
  title: string;

  /** Timestamp of last activity */
  timestamp: Date | string;

  flowVersionId?: string;

  /** Status of the conversation */
  status: ConversationStatusEnum;
}
