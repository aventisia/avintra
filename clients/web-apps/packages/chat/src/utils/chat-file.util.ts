/** A file the assistant wrote into a fenced block of its reply. */
export type ChatFile = {
  name: string;
  contentType: string;
  body: string;
  /** False while the closing fence is still streaming. */
  isComplete: boolean;
};

const FILE_FENCES: Record<string, { name: string; contentType: string }> = {
  html: { name: "Generated UI.html", contentType: "text/html" },
  svg: { name: "Image.svg", contentType: "image/svg+xml" },
  csv: { name: "Data.csv", contentType: "text/csv" },
  tsv: { name: "Data.tsv", contentType: "text/tab-separated-values" },
  markdown: { name: "Document.md", contentType: "text/markdown" },
  md: { name: "Document.md", contentType: "text/markdown" },
};

// Code and ```chart fences stay inline; only these languages are stored as files.
const FILE_FENCE_PATTERN =
  /^```(html|svg|csv|tsv|markdown|md)[ \t]*\n([\s\S]*?)(^```[ \t]*$|$(?![\s\S]))/im;
const BARE_HTML_PATTERN = /^(<!doctype html|<html[\s>])[\s\S]*<\/html>$/i;
const TITLE_PATTERN = /<title[^>]*>([^<]*)<\/title>/i;

const nameFromTitle = (html: string, fallback: string) => {
  const title = TITLE_PATTERN.exec(html)?.[1]
    ?.replace(/[\\/:*?"<>|]/g, "")
    .trim()
    .slice(0, 60);
  return title ? `${title}.html` : fallback;
};

/** Finds the first file in a reply, complete or still streaming; null when there is none. */
export const findChatFile = (text: string): ChatFile | null => {
  const trimmed = text.trim();
  if (BARE_HTML_PATTERN.test(trimmed))
    return {
      name: nameFromTitle(trimmed, "Generated UI.html"),
      contentType: "text/html",
      body: trimmed,
      isComplete: true,
    };

  const match = FILE_FENCE_PATTERN.exec(text);
  const fence = match && FILE_FENCES[match[1]!.toLowerCase()];
  if (!match || !fence) return null;
  const body = match[2]!.trim();
  const name = fence.contentType === "text/html" ? nameFromTitle(body, fence.name) : fence.name;
  return { name, contentType: fence.contentType, body, isComplete: Boolean(match[3]) };
};

const splitAroundChatFile = (text: string): [before: string, after: string] => {
  if (BARE_HTML_PATTERN.test(text.trim())) return ["", ""];
  const match = FILE_FENCE_PATTERN.exec(text);
  if (!match) return [text.trim(), ""];
  return [text.slice(0, match.index).trim(), text.slice(match.index + match[0].length).trim()];
};

/** The reply text before its file, so the file card takes the file's place. */
export const textBeforeChatFile = (text: string) => splitAroundChatFile(text)[0];

/** The reply text after its file. */
export const textAfterChatFile = (text: string) => splitAroundChatFile(text)[1];

/** The UTF-8 size of a file body, which is how stored files are matched back to replies. */
export const chatFileSize = (body: string) => new Blob([body]).size;

/** Formats a byte count for people: 512 B, 3.4 KB, 1.2 MB. */
export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
