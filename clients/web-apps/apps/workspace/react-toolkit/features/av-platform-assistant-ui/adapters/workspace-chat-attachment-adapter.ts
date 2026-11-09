import {
  CompositeAttachmentAdapter,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
  type AttachmentAdapter,
  type CompleteAttachment,
  type PendingAttachment,
} from "@assistant-ui/react";

const WORKSPACE_CHAT_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const WORKSPACE_CHAT_DOCUMENT_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "md",
  "csv",
];

const WORKSPACE_CHAT_DOCUMENT_ACCEPT = [
  ...WORKSPACE_CHAT_DOCUMENT_MIME_TYPES,
  ...WORKSPACE_CHAT_DOCUMENT_EXTENSIONS.map((extension) => `.${extension}`),
].join(",");

const MIME_TYPE_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  txt: "text/plain",
  md: "text/markdown",
  csv: "text/csv",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

const resolveMimeType = (file: File): string => {
  if (file.type) return file.type;
  const dot = file.name.lastIndexOf(".");
  const extension = dot < 0 ? "" : file.name.slice(dot + 1).toLowerCase();
  return MIME_TYPE_BY_EXTENSION[extension] ?? "application/octet-stream";
};

const readFileAsDataURL = (file: File, mimeType: string, signal?: AbortSignal): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.replace(/^data:;base64,/, `data:${mimeType};base64,`));
    };
    reader.onerror = () => reject(reader.error ?? new Error(`Could not read "${file.name}".`));
    signal?.addEventListener(
      "abort",
      () => {
        reader.abort();
        reject(signal.reason);
      },
      { once: true },
    );
    reader.readAsDataURL(file);
  });

class WorkspaceChatDocumentAttachmentAdapter implements AttachmentAdapter {
  accept = WORKSPACE_CHAT_DOCUMENT_ACCEPT;

  async add(state: { file: File }): Promise<PendingAttachment> {
    return {
      id: window.crypto.randomUUID(),
      type: "document",
      name: state.file.name,
      contentType: state.file.type,
      file: state.file,
      status: { type: "requires-action", reason: "composer-send" },
    };
  }

  async send(
    attachment: PendingAttachment,
    options?: { signal?: AbortSignal },
  ): Promise<CompleteAttachment> {
    const mimeType = resolveMimeType(attachment.file);
    const data = await readFileAsDataURL(attachment.file, mimeType, options?.signal);
    return {
      ...attachment,
      status: { type: "complete" },
      content: [{ type: "file", data, mimeType }],
    };
  }

  async remove(): Promise<void> {}
}

/**
 * Routes composer files to content parts: images and text inline, office
 * documents and PDFs as file parts (data URLs the chat API accepts).
 */
export const workspaceChatAttachmentAdapter = new CompositeAttachmentAdapter([
  new SimpleImageAttachmentAdapter(),
  new SimpleTextAttachmentAdapter(),
  new WorkspaceChatDocumentAttachmentAdapter(),
]);
