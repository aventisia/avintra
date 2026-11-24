import {
  type ChatModelAdapter,
  type ChatModelRunResult,
  type ThreadMessage,
  type ThreadUserMessagePart,
} from "@assistant-ui/react";
import { type ChatMention, extractOfficeText } from "@avplatform/chat";

/** A mentioned file's name, media type and data URL. */
export type MentionedFile = { name: string; contentType: string; dataUrl: string };

type MentionedFilesInput = {
  getMentions: () => readonly ChatMention[];
  loadFile: (id: string) => Promise<MentionedFile>;
  onLoadFailed: (name: string) => void;
};

const TEXT_TYPE = /^(text\/|application\/(json|xml)|image\/svg\+xml)/u;
const OFFICE_NAME = /\.(docx|xlsx|xls|ods)$/iu;
const IMAGE_TYPE = /^image\/(png|jpeg|gif|webp)$/u;

const escapeName = (name: string) =>
  name
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const dataUrlBytes = (dataUrl: string) => {
  const comma = dataUrl.indexOf(",");
  const body = dataUrl.slice(comma + 1);
  if (!dataUrl.slice(0, comma).endsWith(";base64"))
    return new TextEncoder().encode(decodeURIComponent(body));
  return Uint8Array.from(atob(body), (char) => char.charCodeAt(0));
};

const toTextPart = (name: string, text: string): ThreadUserMessagePart => ({
  type: "text",
  text: `<attachment name="${escapeName(name)}">\n${text}\n</attachment>`,
});

const toMessagePart = async ({
  name,
  contentType,
  dataUrl,
}: MentionedFile): Promise<ThreadUserMessagePart | null> => {
  if (TEXT_TYPE.test(contentType))
    return toTextPart(name, new TextDecoder().decode(dataUrlBytes(dataUrl)));
  if (OFFICE_NAME.test(name))
    return toTextPart(
      name,
      await extractOfficeText(new File([dataUrlBytes(dataUrl)], name, { type: contentType })),
    );
  if (IMAGE_TYPE.test(contentType)) return { type: "image", image: dataUrl, filename: name };
  if (contentType === "application/pdf")
    return { type: "file", data: dataUrl, mimeType: contentType, filename: name };
  return null;
};

const messageText = (message: ThreadMessage) =>
  message.content.map((part) => (part.type === "text" ? part.text : "")).join("\n");

const mentionedIn = (text: string, mentions: readonly ChatMention[]) => {
  const byLabel = new Map<string, ChatMention>();
  for (const mention of mentions)
    if (text.includes(`@${mention.label}`) && !byLabel.has(mention.label))
      byLabel.set(mention.label, mention);
  return [...byLabel.values()];
};

/**
 * Sends the content of each chat file the newest user message `@`-mentions,
 * the way an attached file is sent.
 */
export const withMentionedFiles = (
  adapter: ChatModelAdapter,
  { getMentions, loadFile, onLoadFailed }: MentionedFilesInput,
): ChatModelAdapter => ({
  ...adapter,
  run: async function* (options) {
    const messages = [...options.messages];
    const last = messages.at(-1);
    if (last?.role === "user") {
      const parts = await Promise.all(
        mentionedIn(messageText(last), getMentions()).map((mention) =>
          loadFile(mention.id)
            .then(toMessagePart)
            .catch(() => {
              onLoadFailed(mention.label);
              return null;
            }),
        ),
      );
      const fileParts = parts.filter((part) => part !== null);
      if (fileParts.length)
        messages[messages.length - 1] = {
          ...last,
          content: [...last.content, ...fileParts],
        } as ThreadMessage;
    }
    const result = adapter.run({ ...options, messages });
    if (Symbol.asyncIterator in result) yield* result as AsyncGenerator<ChatModelRunResult>;
    else yield await result;
  },
});
