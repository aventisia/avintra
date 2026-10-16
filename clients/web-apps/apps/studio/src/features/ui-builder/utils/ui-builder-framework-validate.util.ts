import { UI_BUILDER_FRAMEWORK_UTILITIES } from "../constants/ui-builder-framework-tokens.constant";
import {
  UI_BUILDER_BUILT_CAP,
  UI_BUILDER_MAX_VIOLATIONS,
  UI_BUILDER_SOURCE_CAP,
  UI_BUILDER_VIOLATION_DETAIL_CAP,
} from "../constants/ui-builder-framework.constant";
import { UI_BUILDER_BRIDGE_MARKER_ATTRIBUTE } from "./ui-builder-bridge.util";
import {
  renderUiBuilderFrameworkMarkup,
  transpileUiBuilderFrameworkSource,
  wrapUiBuilderFrameworkDocument,
} from "./ui-builder-framework-build.util";

/** A single framework quality violation raised by the validator. */
export type UiBuilderFrameworkViolation = {
  code: string;
  detail: string;
};

const SAFELIST = new Set(UI_BUILDER_FRAMEWORK_UTILITIES);

const CLASS_NAME_PATTERN = /className\s*=\s*"([^"]*)"|className\s*=\s*'([^']*)'/g;

const UNLABELLED_INPUT_TYPES = ["hidden", "submit", "button", "reset", "image"];

const EXTERNAL_REFERENCE_PATTERNS: ReadonlyArray<readonly [RegExp, string]> = [
  [/https?:\/\//i, "external URL"],
  [/<link\b/i, "<link> element"],
  [/\bsrc\s*=/i, "src attribute"],
  [/\bhref\s*=/i, "href attribute"],
  [/\bfetch\s*\(/i, "fetch() call"],
  [/\bXMLHttpRequest\b/, "XMLHttpRequest"],
  [/\bWebSocket\b/, "WebSocket"],
  [/\beval\s*\(/, "eval() call"],
  [/\blocalStorage\b/, "localStorage access"],
  [/\bdocument\./, "document access"],
  [/\bwindow\./, "window access"],
];

const STYLESHEET_IMPORT_PATTERN = /@import\b/i;

const JSX_INTRODUCER_CHARACTERS = "([{;,:?=&|!>+[-";
const JSX_INTRODUCER_WORDS = ["return", "yield"];
const IDENTIFIER_CHARACTER_PATTERN = /[\w$]/;
const JSX_TAG_CHARACTER_PATTERN = /[A-Za-z_$]/;

const isQuotedLiteral = (value: string) => value === '"' || value === "'" || value === "`";

const isJsxTagStart = (value: string | undefined) =>
  value !== undefined && (value === "/" || value === ">" || JSX_TAG_CHARACTER_PATTERN.test(value));

const toCodeSource = (source: string): string => {
  const output: string[] = [];
  let index = 0;
  let braceDepth = 0;
  let jsxElementDepth = 0;
  let insideJsxTag = false;
  let insideJsxText = false;
  let tagIsClosing = false;
  let tagIsSelfClosing = false;
  let tagBraceBase = 0;
  let textExpressionBase = 0;
  let insideTextExpression = false;

  const previousToken = () => {
    let cursor = output.length - 1;
    while (cursor >= 0 && /\s/.test(output[cursor])) cursor -= 1;
    if (cursor < 0) return { character: "", word: "" };

    let wordStart = cursor;
    while (wordStart >= 0 && IDENTIFIER_CHARACTER_PATTERN.test(output[wordStart])) wordStart -= 1;

    return {
      character: output[cursor],
      word: output.slice(wordStart + 1, cursor + 1).join(""),
    };
  };

  while (index < source.length) {
    const character = source[index];
    const next = source[index + 1];

    if (insideJsxText) {
      if (character === "<") {
        insideJsxText = false;
        insideJsxTag = true;
        tagIsClosing = next === "/";
        tagIsSelfClosing = false;
        tagBraceBase = braceDepth;
        output.push(character);
        index += 1;
        continue;
      }
      if (character === "{") {
        insideJsxText = false;
        insideTextExpression = true;
        textExpressionBase = braceDepth;
        braceDepth += 1;
        output.push(character);
        index += 1;
        continue;
      }
      index += 1;
      continue;
    }

    if (character === "/" && next === "/") {
      while (index < source.length && source[index] !== "\n") index += 1;
      continue;
    }

    if (character === "/" && next === "*") {
      index += 2;
      while (index < source.length && !(source[index] === "*" && source[index + 1] === "/")) {
        index += 1;
      }
      index += 2;
      continue;
    }

    if (isQuotedLiteral(character)) {
      output.push(character, character);
      index += 1;
      while (index < source.length) {
        if (source[index] === "\\") {
          index += 2;
          continue;
        }
        if (source[index] === character) {
          index += 1;
          break;
        }
        index += 1;
      }
      continue;
    }

    if (character === "{") {
      braceDepth += 1;
      output.push(character);
      index += 1;
      continue;
    }

    if (character === "}") {
      braceDepth = Math.max(0, braceDepth - 1);
      output.push(character);
      index += 1;
      if (insideTextExpression && braceDepth === textExpressionBase) {
        insideTextExpression = false;
        if (jsxElementDepth > 0 && !insideJsxTag) insideJsxText = true;
      }
      continue;
    }

    if (!insideJsxTag && character === "<" && isJsxTagStart(next)) {
      const previous = previousToken();
      if (
        previous.character === "" ||
        JSX_INTRODUCER_CHARACTERS.includes(previous.character) ||
        JSX_INTRODUCER_WORDS.includes(previous.word)
      ) {
        insideJsxTag = true;
        tagIsClosing = next === "/";
        tagIsSelfClosing = false;
        tagBraceBase = braceDepth;
        output.push(character);
        index += 1;
        continue;
      }
    }

    if (insideJsxTag && braceDepth === tagBraceBase) {
      if (character === "/" && next === ">") {
        tagIsSelfClosing = true;
        output.push(character);
        index += 1;
        continue;
      }
      if (character === ">") {
        output.push(character);
        index += 1;
        insideJsxTag = false;
        if (tagIsClosing) jsxElementDepth = Math.max(0, jsxElementDepth - 1);
        else if (!tagIsSelfClosing) jsxElementDepth += 1;
        insideJsxText = jsxElementDepth > 0;
        continue;
      }
    }

    output.push(character);
    index += 1;
  }

  return output.join("");
};

const collectClassNameTokens = (source: string): string[] => {
  const tokens: string[] = [];

  for (const match of source.matchAll(CLASS_NAME_PATTERN)) {
    const value = match[1] ?? match[2] ?? "";
    for (const token of value.split(/\s+/)) {
      if (token) tokens.push(token);
    }
  }

  return tokens;
};

type ViolationRecorder = (code: string, detail: string) => void;

const validateAccessibility = (document: string, add: ViolationRecorder): void => {
  const parsed = new DOMParser().parseFromString(document, "text/html");

  for (const image of parsed.querySelectorAll("img")) {
    if (!image.getAttribute("alt")?.trim()) {
      add("V10", "An image is missing alt text.");
    }
  }

  for (const button of parsed.querySelectorAll("button")) {
    if (!button.textContent?.trim() && !button.getAttribute("aria-label")?.trim()) {
      add("V10", "A button has no accessible name.");
    }
  }

  for (const field of parsed.querySelectorAll("input, select, textarea")) {
    const type = (field.getAttribute("type") ?? "").toLowerCase();
    if (field.tagName.toLowerCase() === "input" && UNLABELLED_INPUT_TYPES.includes(type)) continue;

    const hasAriaLabel = Boolean(field.getAttribute("aria-label")?.trim());
    const id = field.getAttribute("id");
    const hasLabelFor = id ? parsed.querySelector(`label[for="${id}"]`) !== null : false;
    if (!hasAriaLabel && !hasLabelFor) {
      add("V10", "A form control is missing a label.");
    }
  }

  if (!parsed.querySelector("header, main, nav, footer")) {
    add("V10", "The page has no landmark element (header, main, nav, footer).");
  }

  for (const element of parsed.querySelectorAll("[tabindex]")) {
    const tabindex = Number(element.getAttribute("tabindex"));
    if (Number.isFinite(tabindex) && tabindex > 0) {
      add("V10", "A positive tabindex is not allowed.");
    }
  }
};

/** Runs the framework quality checks and returns every violation that blocks saving. */
export const validateUiBuilderFramework = (source: string): UiBuilderFrameworkViolation[] => {
  const violations: UiBuilderFrameworkViolation[] = [];
  const add: ViolationRecorder = (code, detail) => {
    if (violations.length >= UI_BUILDER_MAX_VIOLATIONS) return;
    violations.push({ code, detail: detail.slice(0, UI_BUILDER_VIOLATION_DETAIL_CAP) });
  };

  const trimmed = source.trim();
  const codeSource = toCodeSource(trimmed);

  if (!trimmed.startsWith("export default")) {
    add("V1", "The source must start with `export default`.");
  }
  if (trimmed.includes("```")) {
    add("V1", "The source must not contain markdown code fences.");
  }

  const defaultExports = trimmed.match(/export\s+default\s+function\s+[A-Za-z_$][\w$]*/g) ?? [];
  if (defaultExports.length !== 1) {
    add("V2", "The source must contain exactly one `export default function` component.");
  }
  if (/export\s+(?!default\b)/.test(trimmed)) {
    add("V2", "The source must not contain other export statements.");
  }

  if (/(^|[^\w.])import\b/.test(codeSource)) {
    add("V3", "The source must not contain import statements.");
  }
  if (/\brequire\s*\(/.test(codeSource)) {
    add("V3", "The source must not use require().");
  }
  if (/\bexport\s+[\s\S]{0,200}?\bfrom\b/.test(codeSource)) {
    add("V3", "The source must not re-export from another module.");
  }

  for (const [pattern, label] of EXTERNAL_REFERENCE_PATTERNS) {
    if (pattern.test(codeSource)) {
      add("V4", `The source must not use an ${label}.`);
    }
  }

  if (STYLESHEET_IMPORT_PATTERN.test(trimmed)) {
    add("V4", "The source must not use an @import rule.");
  }

  for (const token of collectClassNameTokens(trimmed)) {
    if (!SAFELIST.has(token)) {
      add("V5", `Unknown Tailwind utility class: ${token}.`);
    }
  }

  if (source.length > UI_BUILDER_SOURCE_CAP) {
    add("V8", `The source exceeds ${UI_BUILDER_SOURCE_CAP} characters.`);
  }
  if (trimmed.includes(UI_BUILDER_BRIDGE_MARKER_ATTRIBUTE)) {
    add("V9", "The source must not contain the preview bridge marker.");
  }

  let compiled: string;
  try {
    compiled = transpileUiBuilderFrameworkSource(source);
  } catch (error) {
    add("V6", error instanceof Error ? error.message : String(error));
    return violations;
  }

  let markup: string;
  try {
    markup = renderUiBuilderFrameworkMarkup(compiled);
  } catch (error) {
    add("V7", error instanceof Error ? error.message : String(error));
    return violations;
  }

  if (!markup.trim()) {
    add("V7", "The component rendered no visible markup.");
  }

  const document = wrapUiBuilderFrameworkDocument(markup);

  if (document.length > UI_BUILDER_BUILT_CAP) {
    add("V8", `The built document exceeds ${UI_BUILDER_BUILT_CAP} characters.`);
  }
  if (document.includes(UI_BUILDER_BRIDGE_MARKER_ATTRIBUTE)) {
    add("V9", "The built document must not contain the preview bridge marker.");
  }

  validateAccessibility(document, add);

  return violations;
};
