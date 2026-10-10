export const DEFAULT_MAX_CHUNK_WORDS = 15;

/** Removes Markdown syntax that should not be read aloud. */
export const stripMarkdownForSpeech = (text: string): string =>
  text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s{0,3}(?:[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_~]{1,3}/g, "")
    .replace(/\s+/g, " ")
    .trim();

const splitByWordBudget = (words: string[], maxWords: number): string[] => {
  const parts: string[] = [];
  for (let index = 0; index < words.length; index += maxWords) {
    const part = words.slice(index, index + maxWords).join(" ");
    if (part) parts.push(part);
  }
  return parts;
};

/** Splits prose into sentence-sized speech chunks bounded by a word budget. */
export const splitIntoSpeechChunks = (
  text: string,
  maxWords: number = DEFAULT_MAX_CHUNK_WORDS,
): string[] => {
  const clean = stripMarkdownForSpeech(text);
  if (!clean) return [];

  const sentences = clean.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) ?? [clean];
  const chunks: string[] = [];

  for (const sentence of sentences) {
    const sentenceWords = sentence.trim().split(/\s+/).filter(Boolean);
    if (sentenceWords.length === 0) continue;
    if (sentenceWords.length <= maxWords) {
      chunks.push(sentenceWords.join(" "));
      continue;
    }

    const clauses = sentence.match(/[^,;:—–]+[,;:—–]*/g) ?? [sentence];
    let current: string[] = [];
    const flush = () => {
      const chunk = current.join(" ").trim();
      if (chunk) chunks.push(chunk);
      current = [];
    };

    for (const clause of clauses) {
      const clauseWords = clause.trim().split(/\s+/).filter(Boolean);
      if (clauseWords.length > maxWords) {
        flush();
        chunks.push(...splitByWordBudget(clauseWords, maxWords));
        continue;
      }
      if (current.length + clauseWords.length > maxWords) flush();
      current.push(...clauseWords);
    }
    flush();
  }

  return chunks;
};

export type StreamingSpeechChunker = {
  /** Adds streamed text and returns any chunks that became complete. */
  push: (delta: string) => string[];
  /** Returns the trailing remainder when the stream ends (and clears it). */
  flush: () => string[];
  /** Discards any buffered text. */
  reset: () => void;
};

/** Emits streamed deltas sentence-by-sentence, buffering the partial trailing sentence. */
export const createStreamingSpeechChunker = (
  maxWords: number = DEFAULT_MAX_CHUNK_WORDS,
): StreamingSpeechChunker => {
  let buffer = "";

  return {
    push: (delta) => {
      buffer += delta;
      const match = buffer.match(/^[\s\S]*[.!?…](?=\s|$)/);
      if (!match) return [];
      const completed = match[0];
      buffer = buffer.slice(completed.length);
      return splitIntoSpeechChunks(completed, maxWords);
    },
    flush: () => {
      const remaining = buffer;
      buffer = "";
      return splitIntoSpeechChunks(remaining, maxWords);
    },
    reset: () => {
      buffer = "";
    },
  };
};
