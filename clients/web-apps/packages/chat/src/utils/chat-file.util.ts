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
const TITLE_PATTERNS: Record<string, RegExp> = {
  "text/html": /<title[^>]*>([^<]*)<\/title>/i,
  "image/svg+xml": /<title[^>]*>([^<]*)<\/title>/i,
  "text/markdown": /^#[ \t]+(.+)$/m,
};

const nameFromContent = (body: string, fallback: { name: string; contentType: string }) => {
  const title = TITLE_PATTERNS[fallback.contentType]
    ?.exec(body)?.[1]
    ?.replace(/[\\/:*?"<>|#]/g, "")
    .trim()
    .slice(0, 60);
  return title ? title + fallback.name.slice(fallback.name.lastIndexOf(".")) : fallback.name;
};

/** Finds the first file in a reply, complete or still streaming; null when there is none. */
export const findChatFile = (text: string): ChatFile | null => {
  const trimmed = text.trim();
  if (BARE_HTML_PATTERN.test(trimmed))
    return {
      name: nameFromContent(trimmed, FILE_FENCES.html!),
      contentType: "text/html",
      body: trimmed,
      isComplete: true,
    };

  const match = FILE_FENCE_PATTERN.exec(text);
  const fence = match && FILE_FENCES[match[1]!.toLowerCase()];
  if (!match || !fence) return null;
  const body = match[2]!.trim();
  return {
    name: nameFromContent(body, fence),
    contentType: fence.contentType,
    body,
    isComplete: Boolean(match[3]),
  };
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

/** The UTF-8 size of a file body, which with the type is how stored files are matched back to replies. */
export const chatFileSize = (body: string) => new Blob([body]).size;

/** Encodes file text as the data: URL the server stores, mirroring the backend artifact writer. */
export const toDataUrl = (contentType: string, body: string) => {
  const bytes = new TextEncoder().encode(body);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000)
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `data:${contentType};charset=utf-8;base64,${btoa(binary)}`;
};

/** Formats a byte count for people: 512 B, 3.4 KB, 1.2 MB. */
export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** The text a data: URL carries, percent-encoded or base64; null for any other URL. */
export const readDataUrl = (url: string): string | null => {
  const comma = url.indexOf(",");
  if (!url.startsWith("data:") || comma < 0) return null;
  const payload = url.slice(comma + 1);
  if (!url.slice(0, comma).endsWith(";base64")) return decodeURIComponent(payload);
  return new TextDecoder().decode(Uint8Array.from(atob(payload), (char) => char.charCodeAt(0)));
};

/** Splits CSV or TSV into rows of cells, honouring quoted cells with commas, quotes and newlines. */
export const parseDelimited = (text: string, delimiter: "," | "\t"): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let isQuoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (isQuoted) {
      if (char === '"' && text[i + 1] === '"') cell += text[++i];
      else if (char === '"') isQuoted = false;
      else cell += char;
    } else if (char === '"' && cell === "") isQuoted = true;
    else if (char === delimiter) {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  if (cell !== "" || row.length > 0) rows.push([...row, cell]);
  return rows;
};
