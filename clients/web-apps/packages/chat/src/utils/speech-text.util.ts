import { findChatFile, textAfterChatFile, textBeforeChatFile } from "./chat-file.util";

const stripMarkdown = (markdown: string) =>
  markdown
    .replace(/```[^\n]*\n[\s\S]*?(?:```|$)/g, "Code block.")
    .replace(/^[ \t]*\|?[ \t]*:?-{3,}:?[ \t]*(\|[ \t]*:?-{3,}:?[ \t]*)*\|?[ \t]*$\n?/gm, "")
    .replace(/^[ \t]*\|(.*)\|[ \t]*$/gm, (_, cells: string) =>
      cells
        .split("|")
        .map((cell) => cell.trim())
        .join(", "),
    )
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^[ \t]{0,3}(#{1,6}|>|[-*+]|\d+[.)])[ \t]+/gm, "")
    .replace(/(\*\*|__|~~|`)/g, "")
    .replace(/(^|\W)[*_](\S[^*_]*?)[*_](?=\W|$)/g, "$1$2")
    .replace(/<[^>]+>/g, "")
    .trim();

/** The plain text a reply should be read aloud as: no markdown markers, and a file or code block named rather than read. */
export const toSpeechText = (markdown: string) => {
  const file = findChatFile(markdown);
  if (!file) return stripMarkdown(markdown);
  return [
    stripMarkdown(textBeforeChatFile(markdown)),
    `File ${file.name}.`,
    stripMarkdown(textAfterChatFile(markdown)),
  ]
    .filter(Boolean)
    .join("\n\n");
};
