import {
  ExportedMessageRepository,
  type ThreadHistoryAdapter,
  type ThreadMessageLike,
} from "@assistant-ui/react";
import {
  type ConversationMessageLike,
  groupConversationMessages,
} from "@avplatform/assistant-chat";

import { splitAttachmentText } from "./attachment-text.util";

const restoreTextAttachments = (message: ThreadMessageLike): ThreadMessageLike => {
  const [part] = typeof message.content === "string" ? [] : message.content;
  if (message.role !== "user" || part?.type !== "text") return message;
  const { text, attachments } = splitAttachmentText(part.text, message.id ?? "");
  return attachments.length
    ? { ...message, content: [{ type: "text", text }], attachments }
    : message;
};

/**
 * Loads a persisted conversation into the thread. Appends are ignored because
 * the streaming pipeline already stores every turn.
 */
export const createConversationHistoryAdapter = (
  conversationId: string | undefined,
  loadMessages: (conversationId: string) => Promise<readonly ConversationMessageLike[]>,
): ThreadHistoryAdapter => ({
  load: async () =>
    conversationId
      ? ExportedMessageRepository.fromArray(
          groupConversationMessages(await loadMessages(conversationId)).map(restoreTextAttachments),
        )
      : { messages: [] },
  append: async () => {},
});
