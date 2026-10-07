/**
 * Utilities that turn (streamed) assistant markdown into short, speakable
 * chunks for the Text-to-Speech pipeline.
 *
 * Speech engines synthesize best on sentence-sized inputs, so the chunker keeps
 * prose sentences together and only falls back to a word budget when a single
 * sentence (or clause) is unusually long.
 */

/** Default maximum number of words per synthesized chunk. */
export const DEFAULT_MAX_CHUNK_WORDS = 15;

/**
 * Removes Markdown syntax that should not be read aloud — fenced/inline code,
 * image and link targets, heading/list/quote markers, and emphasis markers.
 * The result is collapsed prose with single spaces.
 */
export const stripMarkdownForSpeech = (text: string): string =>
  text
    // Fenced code blocks and inline code: read neither.
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    // Images: keep only the alt text. Links: keep only the label.
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    // Leading heading / blockquote / list markers.
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s{0,3}(?:[-*+]|\d+\.)\s+/gm, "")
    // Emphasis and strikethrough markers.
    .replace(/[*_~]{1,3}/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Splits a single over-long segment on its words into budget-sized pieces. */
const splitByWordBudget = (words: string[], maxWords: number): string[] => {
  const parts: string[] = [];
  for (let index = 0; index < words.length; index += maxWords) {
    const part = words.slice(index, index + maxWords).join(" ");
    if (part) parts.push(part);
  }
  return parts;
};

/**
 * Splits prose into speech chunks. Sentences are kept whole when they fit the
 * word budget; longer sentences are packed at clause boundaries first, then
 * hard-split by word count as a last resort.
 */
export const splitIntoSpeechChunks = (
  text: string,
  maxWords: number = DEFAULT_MAX_CHUNK_WORDS,
): string[] => {
  const clean = stripMarkdownForSpeech(text);
  if (!clean) return [];

  // Sentence boundaries, keeping the terminator attached to its sentence.
  const sentences = clean.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) ?? [clean];
  const chunks: string[] = [];

  for (const sentence of sentences) {
    const sentenceWords = sentence.trim().split(/\s+/).filter(Boolean);
    if (sentenceWords.length === 0) continue;
    if (sentenceWords.length <= maxWords) {
      chunks.push(sentenceWords.join(" "));
      continue;
    }

    // Long sentence: prefer clause boundaries, then a plain word budget.
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

/**
 * Incrementally chunks streamed deltas. Text up to the last completed sentence
 * is emitted as soon as its terminator arrives; the remainder is buffered until
 * either more deltas complete it or the run finishes and calls `flush`.
 */
export const createStreamingSpeechChunker = (
  maxWords: number = DEFAULT_MAX_CHUNK_WORDS,
): StreamingSpeechChunker => {
  let buffer = "";

  return {
    push: (delta) => {
      buffer += delta;
      // Emit everything up to the last sentence terminator followed by a
      // space or the end of the buffer; keep the partial sentence buffered.
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
