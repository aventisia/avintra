export type ChatSelectionQuote = { fileName: string; text: string };

export const MAX_SELECTION_QUOTE_CHARS = 4000;

/** Adds a quoted file selection to the composer text; null when the selection is blank. */
export const composeSelectionQuote = (
  current: string,
  { fileName, text }: ChatSelectionQuote,
): string | null => {
  const trimmed = text.replace(/\r\n/gu, "\n").trim();
  if (!trimmed) return null;
  const selected = trimmed.slice(0, MAX_SELECTION_QUOTE_CHARS).trimEnd();
  const lines = selected.split("\n").map((line) => (line ? `> ${line}` : ">"));
  if (trimmed.length > MAX_SELECTION_QUOTE_CHARS) lines.push("> …");
  const quote = `About this part of ${fileName}:\n${lines.join("\n")}\n\n`;
  return current.trim() ? `${current.trimEnd()}\n\n${quote}` : quote;
};
