import { ConversationStatusEnum } from "../enums/conversation-status-enum";
import { ConversationMessageDto } from "./conversation-message-dto";

/**
 * Represents a data transfer object (DTO) for admin conversations.
 */
export interface AdminConversationDto {
  /**
   * Gets or sets the unique identifier for the conversation.
   */
  id: string; // Guid → string

  /**
   * Gets or sets the title of the conversation.
   * Generated from the first five words of the most recent message.
   * Defaults to "Untitled Conversation" if no content exists.
   */
  title: string;
  tokenCount?: string;
  creditUsed?: string;

  messages?: ConversationMessageDto[];
  username?: string;
  /**
   * Gets or sets the timestamp representing the last activity of the conversation.
   */
  timestamp: Date;

  /**
   * Gets or sets the current status of the conversation.
   */
  status: ConversationStatusEnum;

  /**
   * Gets or sets the unique identifier of the user.
   */
  userId: string; // Guid → string

  /**
   * Gets or sets the first name of the user. Max-50
   */
  firstName: string;

  /**
   * Gets or sets the last name of the user. Max-50
   */
  lastName: string;

  /**
   * Gets or sets the identifier of the associated flow version.
   */
  flowVersionId: string; // Guid → string

  /**
   * Gets or sets the name of the associated flow.
   */
  flowName?: string;

  /**
   * Gets or sets the version number of the associated flow.
   */
  versionNumber: number;

  /**
   * Gets or sets the username of the user who last modified the record.
   */
  lastModifiedByUsername?: string;

  /**
   * Gets or sets the display name of the user who last modified the record (response only).
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the record was last modified.
   */
  lastModifiedOn?: Date;
}
