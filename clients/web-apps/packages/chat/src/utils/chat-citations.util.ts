import type { ChatSource } from "@avplatform/assistant-chat";

const CODE = /(```[\s\S]*?(?:```|$)|`[^`\n]*`)/;
const MARKER = /\[(\d{1,2})\](?!\()/g;

const markdownUrl = (url: string) =>
  url.replace(
    /[\s()]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")}`,
  );

/** Turns `[n]` markers outside code into links to the nth source. */
export const linkCitations = (text: string, sources: readonly ChatSource[]) =>
  sources.length === 0
    ? text
    : text
        .split(CODE)
        .map((chunk, index) =>
          index % 2 === 1
            ? chunk
            : chunk.replace(MARKER, (marker, n: string) => {
                const source = sources[Number(n) - 1];
                return source ? `[${marker}](${markdownUrl(source.url)})` : marker;
              }),
        )
        .join("");
