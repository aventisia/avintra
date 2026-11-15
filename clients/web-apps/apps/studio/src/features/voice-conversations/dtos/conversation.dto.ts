import type { ConversationChannelEnum } from "../enums/conversation-channel.enum";
import type { ConversationMessageSenderEnum } from "../enums/conversation-message-sender.enum";
import type { ConversationStatusEnum } from "../enums/conversation-status.enum";

export interface ConversationDto {
  id: string;
  userId: string;
  flowVersionId: string;
  title: string;
  status: ConversationStatusEnum;
  channel: ConversationChannelEnum;
  createdOn: string;
  lastModifiedOn: string;
}

export interface ConversationMessageDto {
  id: string;
  conversationId: string;
  flowVersionId: string;
  content: string;
  role: ConversationMessageSenderEnum;
  metadata?: Record<string, unknown> | null;
  files?: string[] | null;
  createdOn: string;
}
