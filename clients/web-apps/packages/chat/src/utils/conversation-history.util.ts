import {
  ExportedMessageRepository,
  type ThreadHistoryAdapter,
  type ThreadMessageLike,
} from "@assistant-ui/react";
// The package entry pulls in the UI package, which needs a browser.
import {
  type ConversationMessageLike,
  groupConversationMessages,
} from "@avplatform/assistant-chat/conversation-messages";

import { splitAttachmentText } from "./attachment-text.util";

const restoreTextAttachments = (message: ThreadMessageLike): ThreadMessageLike => {
  const [part] = typeof message.content === "string" ? [] : message.content;
  if (message.role !== "user" || part?.type !== "text") return message;
  const { text, attachments } = splitAttachmentText(part.text, message.id ?? "");
  return attachments.length
    ? { ...message, content: [{ type: "text", text }], attachments }
    : message;
};

const toThreadMessages = (messages: readonly ConversationMessageLike[]) =>
  groupConversationMessages(messages).map(restoreTextAttachments);

const textOf = ({ content }: ThreadMessageLike) =>
  typeof content === "string"
    ? content
    : content
        .map((part) => (part.type === "text" ? part.text : ""))
        .filter(Boolean)
        .join("\n\n");

/** A saved chat as a Markdown document: its title, then each message under its speaker. */
export const toChatMarkdown = (title: string, messages: readonly ConversationMessageLike[]) =>
  [
    `# ${title}`,
    ...toThreadMessages(messages)
      .filter((message) => message.role === "user" || message.role === "assistant")
      .map((message) =>
        [
          `## ${message.role === "user" ? "You" : "Assistant"}`,
          textOf(message).trim(),
          ...(message.attachments ?? []).map((attachment) => `_Attached: ${attachment.name}_`),
        ]
          .filter(Boolean)
          .join("\n\n"),
      ),
  ].join("\n\n") + "\n";

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
      ? ExportedMessageRepository.fromArray(toThreadMessages(await loadMessages(conversationId)))
      : { messages: [] },
  append: async () => {},
});
