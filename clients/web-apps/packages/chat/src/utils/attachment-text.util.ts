import {
  type ChatModelAdapter,
  type CompleteAttachment,
  type ThreadMessage,
} from "@assistant-ui/react";

const ATTACHMENT_BLOCK = /<attachment name="([^"]*)">\n[\s\S]*?\n<\/attachment>/g;

const unescapeName = (name: string) =>
  name
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");

const inlineAttachmentText = (message: ThreadMessage): ThreadMessage => {
  if (message.role !== "user") return message;
  const textParts = message.attachments.flatMap((attachment) =>
    attachment.content.filter((part) => part.type === "text"),
  );
  return textParts.length ? { ...message, content: [...message.content, ...textParts] } : message;
};

/** Sends each text attachment to the model as part of its message's text. */
export const withAttachmentText = (adapter: ChatModelAdapter): ChatModelAdapter => ({
  ...adapter,
  run: (options) =>
    adapter.run({ ...options, messages: options.messages.map(inlineAttachmentText) }),
});

/** Splits text attachments inlined by {@link withAttachmentText} back out of a saved message. */
export const splitAttachmentText = (text: string, messageId: string) => ({
  text: text.replace(ATTACHMENT_BLOCK, "").trim(),
  attachments: [...text.matchAll(ATTACHMENT_BLOCK)].map(
    ([block, name], index): CompleteAttachment => ({
      id: `${messageId}-attachment-${index}`,
      type: "document",
      name: unescapeName(name ?? ""),
      contentType: "text/plain",
      status: { type: "complete" },
      content: [{ type: "text", text: block }],
    }),
  ),
});
