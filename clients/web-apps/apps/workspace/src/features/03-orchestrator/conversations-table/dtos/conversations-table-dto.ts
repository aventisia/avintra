import { ConversationChannelEnum } from "../enums/conversation-channel.enum";
import { ConversationStatusEnum } from "../enums/conversation-status-enum";
import { ConversationMessageDto } from "./conversation-message-dto";

/**
 * Represents a data transfer object (DTO) for admin conversations.
 */
export interface AdminConversationDto {
  /**
   * Gets or sets the unique identifier for the conversation.
   */
  id: string;

  /**
   * Gets or sets the title of the conversation.
   */
  title: string;

  /**
   * Gets or sets the timestamp representing the last activity of the conversation.
   */
  timestamp: Date;

  /**
   * Gets or sets the current status of the conversation.
   */
  status: ConversationStatusEnum;

  /**
   * Gets or sets the channel that created the conversation.
   */
  channel: ConversationChannelEnum;

  /**
   * Gets or sets the total number of exchange.
   */
  totalExchange?: number;

  /**
   * Gets or sets the unique identifier of the user.
   */
  userId: string;

  /**
   * Gets or sets the first name of the user.
   */
  firstName: string;

  /**
   * Gets or sets the last name of the user.
   */
  lastName: string;
  /**
   * Gets or sets the the username of the user
   */
  username?: string;

  /**
   * Gets or sets the identifier of the associated flow version.
   */
  flowVersionId: string;

  /**
   * Gets or sets the name of the associated flow.
   */
  flowName?: string;

  /**
   * Gets or sets the version number of the associated flow.
   */
  versionNumber: number;

  /**
   *  Gets or sets the collection of messages that belong to the conversation.
   */
  messages?: ConversationMessageDto[];
}
