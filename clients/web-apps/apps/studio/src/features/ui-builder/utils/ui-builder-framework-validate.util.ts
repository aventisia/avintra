import { UI_BUILDER_FRAMEWORK_UTILITIES } from "../constants/ui-builder-framework-tokens.constant";
import {
  UI_BUILDER_BUILT_CAP,
  UI_BUILDER_MAX_VIOLATIONS,
  UI_BUILDER_SOURCE_CAP,
  UI_BUILDER_VIOLATION_DETAIL_CAP,
} from "../constants/ui-builder-framework.constant";
import { UI_BUILDER_BRIDGE_MARKER_ATTRIBUTE } from "./ui-builder-bridge.util";
import { transpileUiBuilderFrameworkSource } from "./ui-builder-framework-build.util";
import { type UiBuilderProbeResult } from "./ui-builder-probe.util";

/** A single framework quality violation raised by the validator. */
export type UiBuilderFrameworkViolation = {
  code: string;
  detail: string;
};

const SAFELIST = new Set(UI_BUILDER_FRAMEWORK_UTILITIES);

const CLASS_NAME_PATTERN = /className\s*=\s*"([^"]*)"|className\s*=\s*'([^']*)'/g;

const UNLABELLED_INPUT_TYPES = ["hidden", "submit", "button", "reset", "image"];

const EXTERNAL_URL_PATTERN = /(?:https?:)?\/\/(?!www\.w3\.org\/)[a-z0-9-]+(?:\.[a-z0-9-]+)+/i;

const EXTERNAL_REFERENCE_PATTERNS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bfetch\s*\(/i, "fetch() call"],
  [/\bXMLHttpRequest\b/, "XMLHttpRequest"],
  [/\bWebSocket\b/, "WebSocket"],
  [/\bEventSource\b/, "EventSource"],
  [/\beval\s*\(/, "eval() call"],
  [/\blocalStorage\b/, "localStorage access"],
  [/\bsessionStorage\b/, "sessionStorage access"],
  [/\bwindow\.(?:parent|top|opener)\b/, "parent window access"],
];

const HTML_EXTERNAL_REFERENCE_PATTERNS: ReadonlyArray<readonly [RegExp, string]> = [
  [/<link\b[^>]*\bhref\s*=\s*["']?(?:https?:)?\/\//i, "external stylesheet or font"],
  [/<script\b[^>]*\bsrc\s*=/i, "external script"],
  [/\b(?:src|srcset)\s*=\s*["']?(?:https?:)?\/\//i, "external image or media URL"],
  [/url\(\s*["']?(?:https?:)?\/\//i, "external CSS url()"],
  [/@import\b/i, "@import rule"],
  [/\bfetch\s*\(/i, "fetch() call"],
  [/\bXMLHttpRequest\b/, "XMLHttpRequest"],
  [/\bWebSocket\b/, "WebSocket"],
  [/\blocalStorage\b/, "localStorage access"],
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

/** Static checks for one generated artifact, split into blocking violations and advisories. */
export type UiBuilderCheckResult = {
  violations: UiBuilderFrameworkViolation[];
  warnings: UiBuilderFrameworkViolation[];
};

const createRecorder =
  (target: UiBuilderFrameworkViolation[]): ViolationRecorder =>
  (code, detail) => {
    if (target.length >= UI_BUILDER_MAX_VIOLATIONS) return;
    const trimmed = detail.slice(0, UI_BUILDER_VIOLATION_DETAIL_CAP);
    if (target.some((entry) => entry.code === code && entry.detail === trimmed)) return;
    target.push({ code, detail: trimmed });
  };

/** Runs the static checks for a framework JSX source; never evaluates the code. */
export const validateUiBuilderFrameworkSource = (source: string): UiBuilderCheckResult => {
  const violations: UiBuilderFrameworkViolation[] = [];
  const warnings: UiBuilderFrameworkViolation[] = [];
  const add = createRecorder(violations);
  const warn = createRecorder(warnings);

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
    if (pattern.test(codeSource)) add("V4", `The source must not use an ${label}.`);
  }
  if (EXTERNAL_URL_PATTERN.test(trimmed)) {
    add("V4", "The source must not reference external URLs; use inline SVG or data URIs instead.");
  }
  if (STYLESHEET_IMPORT_PATTERN.test(trimmed)) {
    add("V4", "The source must not use an @import rule.");
  }

  const unknownClasses = [
    ...new Set(collectClassNameTokens(trimmed).filter((token) => !SAFELIST.has(token))),
  ];
  if (unknownClasses.length > 0) {
    warn(
      "V5",
      `Unstyled utility classes (not in the design system): ${unknownClasses.slice(0, 20).join(", ")}.`,
    );
  }

  if (source.length > UI_BUILDER_SOURCE_CAP) {
    add("V8", `The source exceeds ${UI_BUILDER_SOURCE_CAP} characters.`);
  }
  if (trimmed.includes(UI_BUILDER_BRIDGE_MARKER_ATTRIBUTE)) {
    add("V9", "The source must not contain the preview bridge marker.");
  }

  try {
    transpileUiBuilderFrameworkSource(source);
  } catch (error) {
    add("V6", error instanceof Error ? error.message : String(error));
  }

  return { violations, warnings };
};

/** Runs the static checks for a generated HTML document. */
export const validateUiBuilderHtmlSource = (html: string): UiBuilderCheckResult => {
  const violations: UiBuilderFrameworkViolation[] = [];
  const add = createRecorder(violations);
  const trimmed = html.trim();

  if (!/^<!doctype html/i.test(trimmed)) {
    add("V1", "The document must start with <!doctype html>.");
  }
  if (trimmed.includes("```")) {
    add("V1", "The document must not contain markdown code fences.");
  }
  if (!/<\/html>\s*$/i.test(trimmed)) {
    add("V1", "The document is incomplete: it must end with </html>.");
  }
  for (const [pattern, label] of HTML_EXTERNAL_REFERENCE_PATTERNS) {
    if (pattern.test(trimmed)) add("V4", `The document must not use an ${label}.`);
  }
  if (html.length > UI_BUILDER_BUILT_CAP) {
    add("V8", `The document exceeds ${UI_BUILDER_BUILT_CAP} characters.`);
  }
  if (trimmed.includes(UI_BUILDER_BRIDGE_MARKER_ATTRIBUTE)) {
    add("V9", "The document must not contain the preview bridge marker.");
  }

  return { violations, warnings: [] };
};

/** Checks the result of rendering a document once: runtime errors, empty output, and accessibility. */
export const checkUiBuilderRenderedOutput = (probe: UiBuilderProbeResult): UiBuilderCheckResult => {
  const violations: UiBuilderFrameworkViolation[] = [];
  const add = createRecorder(violations);

  for (const message of probe.errors) add("V7", `Runtime error: ${message}`);
  if (probe.timedOut && probe.errors.length === 0) {
    add("V7", "The interface did not finish rendering (it may loop forever or block on startup).");
  }
  if (!probe.timedOut && probe.errors.length === 0 && !probe.markup.trim()) {
    add("V7", "The interface rendered no visible markup.");
  }
  if (probe.markup.trim()) {
    validateAccessibility(`<!doctype html><html><body>${probe.markup}</body></html>`, add);
  }

  return { violations, warnings: [] };
};
