import {
  type AttachmentAdapter,
  CompositeAttachmentAdapter,
  type PendingAttachment,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
} from "@assistant-ui/react";

import { extractOfficeText } from "./office-text.util";

/** Most files one message may carry; the composer blocks sending above it. */
export const CHAT_ATTACHMENT_LIMIT = 3;

const MAX_FILE_BYTES = 10 * 1024 * 1024;

class ChatImageAdapter extends SimpleImageAttachmentAdapter {
  override accept = "image/png,image/jpeg,image/gif,image/webp";
}

class ChatPdfAdapter extends SimpleImageAttachmentAdapter {
  override accept = "application/pdf,.pdf";

  override async add(state: { file: File }) {
    return { ...(await super.add(state)), type: "document" } satisfies PendingAttachment;
  }

  override async send(attachment: PendingAttachment, options?: { signal?: AbortSignal }) {
    const sent = await super.send(attachment, options);
    return {
      ...sent,
      content: sent.content.map((part) =>
        part.type === "image"
          ? {
              type: "file" as const,
              data: part.image,
              mimeType: "application/pdf",
              filename: sent.name,
            }
          : part,
      ),
    };
  }
}

class ChatTextAdapter extends SimpleTextAttachmentAdapter {
  override accept =
    "text/plain,text/markdown,text/csv,text/tab-separated-values,text/xml,application/xml,application/json,.txt,.md,.csv,.tsv,.xml,.json";
}

class ChatOfficeAdapter extends SimpleTextAttachmentAdapter {
  override accept =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/vnd.oasis.opendocument.spreadsheet,.docx,.xlsx,.xls,.ods";

  override async send(attachment: PendingAttachment, options?: { signal?: AbortSignal }) {
    const text = await extractOfficeText(attachment.file);
    return super.send(
      { ...attachment, file: new File([text], attachment.name, { type: "text/plain" }) },
      options,
    );
  }
}

/**
 * Accepts images and PDFs (sent to the model as files), and text files, Word
 * documents and spreadsheets (inlined into the message as text), up to 10 MB each.
 */
export const createChatAttachmentAdapter = () => {
  const adapter = new CompositeAttachmentAdapter([
    new ChatImageAdapter(),
    new ChatPdfAdapter(),
    new ChatTextAdapter(),
    new ChatOfficeAdapter(),
  ]);

  return {
    accept: adapter.accept,
    add: (state) => {
      if (state.file.size > MAX_FILE_BYTES) {
        throw new Error(`${state.file.name} is larger than 10 MB.`);
      }
      return adapter.add(state);
    },
    send: (...args) => adapter.send(...args),
    remove: (attachment) => adapter.remove(attachment),
  } satisfies AttachmentAdapter;
};
