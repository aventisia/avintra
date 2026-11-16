export type WorkspaceChatHtmlArtifact = {
  name: string;
  contentType: string;
  body: string;
};

const CODE_FENCE_PATTERN = /```(\w*)\s*\n([\s\S]*?)```/;
const OPENING_FENCE_PATTERN = /```(\w*)[ \t]*\n/;
const BARE_HTML_PATTERN = /<html[\s>]/i;
const TITLE_PATTERN = /<title[^>]*>([^<]*)<\/title>/i;

const extensionForFenceLanguage = (language: string): string => {
  switch (language.toLowerCase()) {
    case "html":
      return "html";
    case "css":
      return "css";
    case "javascript":
    case "js":
      return "js";
    case "jsx":
      return "jsx";
    case "typescript":
    case "ts":
      return "ts";
    case "tsx":
      return "tsx";
    case "json":
      return "json";
    case "markdown":
    case "md":
      return "md";
    case "csv":
      return "csv";
    case "tsv":
      return "tsv";
    case "xml":
      return "xml";
    case "pdf":
      return "pdf";
    case "doc":
      return "doc";
    case "docx":
      return "docx";
    case "xls":
      return "xls";
    case "xlsx":
      return "xlsx";
    case "ppt":
      return "ppt";
    case "pptx":
      return "pptx";
    case "png":
      return "png";
    case "jpg":
    case "jpeg":
      return "jpg";
    case "gif":
      return "gif";
    case "webp":
      return "webp";
    case "bmp":
      return "bmp";
    case "svg":
      return "svg";
    case "txt":
    case "text":
      return "txt";
    default:
      return "txt";
  }
};

const contentTypeForExtension = (extension: string): string => {
  switch (extension) {
    case "html":
      return "text/html";
    case "css":
      return "text/css";
    case "js":
      return "text/javascript";
    case "json":
      return "application/json";
    case "md":
      return "text/markdown";
    case "csv":
      return "text/csv";
    case "tsv":
      return "text/tab-separated-values";
    case "xml":
      return "application/xml";
    case "pdf":
      return "application/pdf";
    case "doc":
      return "application/msword";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xls":
      return "application/vnd.ms-excel";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "ppt":
      return "application/vnd.ms-powerpoint";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "png":
      return "image/png";
    case "jpg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "bmp":
      return "image/bmp";
    case "svg":
      return "image/svg+xml";
    default:
      return "text/plain";
  }
};

export const extractWorkspaceChatHtmlArtifact = (
  text: string,
): WorkspaceChatHtmlArtifact | null => {
  const source = text ?? "";
  const htmlFence = /```html\s*\n([\s\S]*?)```/i.exec(source)?.[1]?.trim();
  if (htmlFence) {
    const title = TITLE_PATTERN.exec(htmlFence)?.[1]
      ?.trim()
      .replace(/[\\/:*?"<>|]/g, "")
      .slice(0, 60);
    return {
      name: title ? `${title}.html` : "Generated UI.html",
      contentType: "text/html",
      body: htmlFence,
    };
  }

  const trimmed = source.trim();
  if (BARE_HTML_PATTERN.test(trimmed) && trimmed.length < 500000) {
    return { name: "Generated UI.html", contentType: "text/html", body: trimmed };
  }

  const fence = CODE_FENCE_PATTERN.exec(source);
  const body = fence?.[2]?.trim();
  if (!body) return null;
  const extension = extensionForFenceLanguage(fence?.[1] ?? "");
  return {
    name: `Code.${extension}`,
    contentType: contentTypeForExtension(extension),
    body,
  };
};

/**
 * Removes the block `extractWorkspaceChatHtmlArtifact` would store, keeping
 * the surrounding prose. Mirrors the extractor's priority exactly, and also
 * removes a still-streaming (unclosed) fence so code never shows mid-stream.
 */
export const stripWorkspaceChatArtifactContent = (text: string): string => {
  const source = text ?? "";
  const htmlFence = /```html\s*\n([\s\S]*?)```/i.exec(source);
  if (htmlFence?.[1]?.trim()) return source.replace(htmlFence[0], "");

  const trimmed = source.trim();
  if (BARE_HTML_PATTERN.test(trimmed) && trimmed.length < 500000) return "";

  const fence = CODE_FENCE_PATTERN.exec(source);
  if (fence?.[2]?.trim()) return source.replace(fence[0], "");

  const opening = OPENING_FENCE_PATTERN.exec(source);
  if (opening && source.indexOf("```", opening.index + opening[0].length) === -1) {
    return source.slice(0, opening.index);
  }
  return source;
};

export type WorkspaceChatArtifactPeek = {
  name: string;
  contentType: string;
};

/**
 * Names the artifact a text is producing, whether its fence already closed
 * or is still streaming. Null when there is no artifact fence at all.
 */
export const peekWorkspaceChatArtifact = (text: string): WorkspaceChatArtifactPeek | null => {
  const complete = extractWorkspaceChatHtmlArtifact(text ?? "");
  if (complete) return { name: complete.name, contentType: complete.contentType };

  const source = text ?? "";
  const opening = OPENING_FENCE_PATTERN.exec(source);
  if (!opening) return null;
  if (source.indexOf("```", opening.index + opening[0].length) !== -1) return null;

  const language = (opening[1] ?? "").toLowerCase();
  if (language === "html") return { name: "Generated UI.html", contentType: "text/html" };
  const extension = extensionForFenceLanguage(opening[1] ?? "");
  return { name: `Code.${extension}`, contentType: contentTypeForExtension(extension) };
};
