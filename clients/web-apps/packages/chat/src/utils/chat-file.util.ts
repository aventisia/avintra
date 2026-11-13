/** A file the assistant wrote into a fenced block of its reply. */
export type ChatFile = {
  name: string;
  contentType: string;
  body: string;
  /** False while the closing fence is still streaming. */
  isComplete: boolean;
};

const DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const PPTX_TYPE = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

/** File types the server builds from a spec block, matched back by name and type. */
export const SYNTHESIZED_FILE_TYPES = [DOCX_TYPE, XLSX_TYPE, PPTX_TYPE];

const FILE_FENCES: Record<string, { name: string; contentType: string }> = {
  html: { name: "Generated UI.html", contentType: "text/html" },
  svg: { name: "Image.svg", contentType: "image/svg+xml" },
  csv: { name: "Data.csv", contentType: "text/csv" },
  tsv: { name: "Data.tsv", contentType: "text/tab-separated-values" },
  markdown: { name: "Document.md", contentType: "text/markdown" },
  md: { name: "Document.md", contentType: "text/markdown" },
  "doc-spec": { name: "Document.docx", contentType: DOCX_TYPE },
  "sheet-spec": { name: "Data.xlsx", contentType: XLSX_TYPE },
  "slide-spec": { name: "Slides.pptx", contentType: PPTX_TYPE },
};

// Code, ```chart and ```blueprint fences stay inline; only these languages are stored as files.
const FILE_FENCE_PATTERN =
  /^```(html|svg|csv|tsv|markdown|md)[ \t]*\n([\s\S]*?)(^```[ \t]*$|$(?![\s\S]))/im;
// IMPORTANT NOTE: mirrors the backend spec match; doc-spec bodies hold markdown that can
// itself contain fenced code blocks, so the reply's last fence closes a doc-spec.
const SPEC_FENCE_PATTERN =
  /^```(sheet-spec|slide-spec)[ \t]*\n([\s\S]*?)(^```[ \t]*$|$(?![\s\S]))/im;
const DOC_SPEC_FENCE_PATTERN = /^```(doc-spec)[ \t]*\n([\s\S]*)(^```[ \t]*$)/im;
const DOC_SPEC_STREAMING_PATTERN = /^```(doc-spec)[ \t]*\n([\s\S]*)$/im;
const BARE_HTML_PATTERN = /^(<!doctype html|<html[\s>])[\s\S]*<\/html>$/i;
const TITLE_PATTERNS: Record<string, RegExp> = {
  "text/html": /<title[^>]*>([^<]*)<\/title>/i,
  "image/svg+xml": /<title[^>]*>([^<]*)<\/title>/i,
  "text/markdown": /^#[ \t]+(.+)$/m,
};

/** Reads the title a spec block carries: the first Markdown heading, or the JSON title. */
const specTitle = (body: string, contentType: string) => {
  if (contentType === DOCX_TYPE) return /^#[ \t]+(.+)$/m.exec(body)?.[1] ?? "";
  try {
    const title = (JSON.parse(body) as { title?: unknown }).title;
    return typeof title === "string" ? title : "";
  } catch {
    return "";
  }
};

const nameFromContent = (body: string, fallback: { name: string; contentType: string }) => {
  const rawTitle = SYNTHESIZED_FILE_TYPES.includes(fallback.contentType)
    ? specTitle(body, fallback.contentType)
    : (TITLE_PATTERNS[fallback.contentType]?.exec(body)?.[1] ?? "");
  const title = rawTitle
    .replace(/[\\/:*?"<>|#]/g, "")
    .trim()
    .slice(0, 60);
  return title ? title + fallback.name.slice(fallback.name.lastIndexOf(".")) : fallback.name;
};

/** The leftmost complete file fence, or the leftmost still-streaming one when nothing closed. */
const findFileMatch = (text: string) => {
  const complete = [FILE_FENCE_PATTERN, SPEC_FENCE_PATTERN, DOC_SPEC_FENCE_PATTERN]
    .map((pattern) => ({ pattern, match: pattern.exec(text) }))
    .filter((entry) => entry.match !== null)
    .sort((a, b) => a.match!.index - b.match!.index)[0];
  if (complete)
    return {
      kind: complete.match![1]!,
      body: complete.match![2]!.trim(),
      isComplete: Boolean(complete.match![3]),
      index: complete.match!.index,
      length: complete.match![0].length,
    };

  const streaming = [FILE_FENCE_PATTERN, SPEC_FENCE_PATTERN, DOC_SPEC_STREAMING_PATTERN]
    .map((pattern) => pattern.exec(text))
    .filter((match) => match !== null)
    .sort((a, b) => a.index - b.index)[0];
  return streaming
    ? {
        kind: streaming[1]!,
        body: streaming[2]!.trim(),
        isComplete: false,
        index: streaming.index,
        length: streaming[0].length,
      }
    : null;
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

  const match = findFileMatch(text);
  const fence = match && FILE_FENCES[match.kind.toLowerCase()];
  if (!match || !fence) return null;
  return {
    name: nameFromContent(match.body, fence),
    contentType: fence.contentType,
    body: match.body,
    isComplete: match.isComplete,
  };
};

const splitAroundChatFile = (text: string): [before: string, after: string] => {
  if (BARE_HTML_PATTERN.test(text.trim())) return ["", ""];
  const match = findFileMatch(text);
  if (!match) return [text.trim(), ""];
  return [text.slice(0, match.index).trim(), text.slice(match.index + match.length).trim()];
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
