import { parse } from "sucrase/dist/esm/parser";
import { TokenType } from "sucrase/dist/esm/parser/tokenizer/types";

/** Attribute stamped on rendered elements that links them to their JSX tag in the source. */
export const UI_BUILDER_SOURCE_ID_ATTRIBUTE = "data-avk-id";

type Token = { type: number; start: number; end: number };

/** An opening JSX tag located in a component source. */
export type UiBuilderSourceTag = {
  name: string;
  start: number;
  nameEnd: number;
  end: number;
  className: { value: string; start: number; end: number } | null;
  hasClassName: boolean;
  text: { value: string; start: number; end: number } | null;
};

const FRAGMENT_NAMES = new Set(["Fragment", "React.Fragment"]);
const OPENERS = new Set<number>([TokenType.braceL, TokenType.dollarBraceL]);

const tokenize = (source: string): Token[] => parse(source, true, true, false).tokens as Token[];

const readStringLiteral = (source: string, token: Token) => {
  const raw = source.slice(token.start, token.end);
  return { value: raw.slice(1, -1), start: token.start + 1, end: token.end - 1 };
};

const readClassName = (source: string, tokens: Token[], from: number, to: number) => {
  let depth = 0;
  for (let index = from; index < to; index += 1) {
    const token = tokens[index];
    if (OPENERS.has(token.type)) depth += 1;
    else if (token.type === TokenType.braceR) depth -= 1;
    if (depth !== 0 || token.type !== TokenType.jsxName) continue;
    if (source.slice(token.start, token.end) !== "className") continue;
    if (tokens[index + 1]?.type !== TokenType.eq) return { found: true, literal: null };

    const value = tokens[index + 2];
    if (value?.type === TokenType.string)
      return { found: true, literal: readStringLiteral(source, value) };
    if (value?.type === TokenType.braceL) {
      const inner = tokens[index + 3];
      if (inner?.type === TokenType.string && tokens[index + 4]?.type === TokenType.braceR) {
        return { found: true, literal: readStringLiteral(source, inner) };
      }
      if (
        inner?.type === TokenType.backQuote &&
        tokens[index + 4]?.type === TokenType.template &&
        tokens[index + 5]?.type === TokenType.backQuote &&
        tokens[index + 6]?.type === TokenType.braceR
      ) {
        const template = tokens[index + 4];
        return {
          found: true,
          literal: {
            value: source.slice(template.start, template.end),
            start: template.start,
            end: template.end,
          },
        };
      }
    }
    return { found: true, literal: null };
  }
  return { found: false, literal: null };
};

const readStaticText = (source: string, tokens: Token[], tagEndIndex: number) => {
  const text = tokens[tagEndIndex + 1];
  if (
    text?.type === TokenType.jsxText &&
    tokens[tagEndIndex + 2]?.type === TokenType.jsxTagStart &&
    tokens[tagEndIndex + 3]?.type === TokenType.slash
  ) {
    const raw = source.slice(text.start, text.end);
    const leading = raw.length - raw.trimStart().length;
    const value = raw.trim();
    return value
      ? { value, start: text.start + leading, end: text.start + leading + value.length }
      : null;
  }
  return null;
};

/** Lists every opening JSX tag of a source in document order; fragments are skipped. */
export const collectUiBuilderSourceTags = (source: string): UiBuilderSourceTag[] => {
  const tokens = tokenize(source);
  const tags: UiBuilderSourceTag[] = [];

  for (let index = 0; index < tokens.length; index += 1) {
    if (tokens[index].type !== TokenType.jsxTagStart) continue;
    const first = tokens[index + 1];
    if (!first || first.type === TokenType.slash || first.type === TokenType.jsxTagEnd) continue;

    let nameEndIndex = index + 2;
    while (
      tokens[nameEndIndex]?.type === TokenType.dot &&
      tokens[nameEndIndex + 1]?.type === TokenType.jsxName
    ) {
      nameEndIndex += 2;
    }
    const name = source.slice(first.start, tokens[nameEndIndex - 1].end);

    let depth = 0;
    let endIndex = nameEndIndex;
    for (; endIndex < tokens.length; endIndex += 1) {
      const token = tokens[endIndex];
      if (OPENERS.has(token.type)) depth += 1;
      else if (token.type === TokenType.braceR) depth -= 1;
      else if (depth === 0 && token.type === TokenType.jsxTagEnd) break;
    }
    if (endIndex >= tokens.length) continue;

    const isSelfClosing = tokens[endIndex - 1]?.type === TokenType.slash;
    const className = readClassName(source, tokens, nameEndIndex, endIndex);
    tags.push({
      name,
      start: tokens[index].start,
      nameEnd: tokens[nameEndIndex - 1].end,
      end: tokens[endIndex].end,
      className: className.literal,
      hasClassName: className.found,
      text: isSelfClosing ? null : readStaticText(source, tokens, endIndex),
    });
  }

  return tags.filter((tag) => !FRAGMENT_NAMES.has(tag.name));
};

/**
 * Returns a build-only copy of a source in which every JSX element carries its tag index, so a
 * click in the preview can be traced back to the tag. Falls back to the source when it does not parse.
 */
export const instrumentUiBuilderSource = (source: string) => {
  let tags: UiBuilderSourceTag[];
  try {
    tags = collectUiBuilderSourceTags(source);
  } catch {
    return source;
  }
  let output = source;
  for (let index = tags.length - 1; index >= 0; index -= 1) {
    const tag = tags[index];
    output = `${output.slice(0, tag.nameEnd)} ${UI_BUILDER_SOURCE_ID_ATTRIBUTE}="${index}"${output.slice(tag.nameEnd)}`;
  }
  return output;
};

/** Finds the opening tag with the given index, or null when the source changed shape. */
export const findUiBuilderSourceTag = (source: string, sourceId: string) => {
  const index = Number(sourceId);
  if (!Number.isInteger(index) || index < 0) return null;
  try {
    return collectUiBuilderSourceTags(source)[index] ?? null;
  } catch {
    return null;
  }
};

/** Rewrites a tag's static className, adding one when the tag has none. */
export const applyUiBuilderClassChange = (
  source: string,
  sourceId: string,
  change: (classes: string[]) => string[],
) => {
  const tag = findUiBuilderSourceTag(source, sourceId);
  if (!tag) throw new Error("The selected element could not be found in the source.");
  if (tag.hasClassName && !tag.className) {
    throw new Error(
      "This element's classes are computed in code; describe the change in the chat instead.",
    );
  }
  const current = tag.className ? tag.className.value.split(/\s+/).filter(Boolean) : [];
  const next = change(current).join(" ");
  if (tag.className) {
    return `${source.slice(0, tag.className.start)}${next}${source.slice(tag.className.end)}`;
  }
  return `${source.slice(0, tag.nameEnd)} className="${next}"${source.slice(tag.nameEnd)}`;
};

/** Replaces a tag's static text child. */
export const applyUiBuilderTextChange = (source: string, sourceId: string, text: string) => {
  const tag = findUiBuilderSourceTag(source, sourceId);
  if (!tag?.text)
    throw new Error("This element's text is not static; describe the change in the chat instead.");
  const replacement = /[{}<>]/.test(text) ? `{${JSON.stringify(text)}}` : text;
  return `${source.slice(0, tag.text.start)}${replacement}${source.slice(tag.text.end)}`;
};

/** Returns the opening tag text for prompts, capped to a readable length. */
export const describeUiBuilderSourceTag = (source: string, tag: UiBuilderSourceTag, cap = 400) => {
  const text = source.slice(tag.start, tag.end);
  return text.length > cap ? `${text.slice(0, cap)}…` : text;
};
