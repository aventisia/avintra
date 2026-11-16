import type { BundledLanguage, Highlighter, ThemedToken } from "shiki";

const THEMES = { light: "github-light-default", dark: "github-dark-default" } as const;

const MAX_HIGHLIGHTED_CHARS = 20_000;

let highlighterPromise: Promise<Highlighter> | undefined;
let highlighter: Highlighter | undefined;

const getHighlighter = () =>
  (highlighterPromise ??= import("shiki").then(
    ({ createHighlighter, createJavaScriptRegexEngine }) =>
      createHighlighter({
        themes: Object.values(THEMES),
        langs: [],
        engine: createJavaScriptRegexEngine(),
      }),
  ));

/**
 * Loads Shiki and the grammar for `language` on first use. Resolves false for
 * languages Shiki doesn't ship.
 */
export const loadCodeLanguage = async (language: string): Promise<boolean> => {
  const { bundledLanguages } = await import("shiki");
  if (!Object.hasOwn(bundledLanguages, language)) return false;
  const loaded = await getHighlighter();
  await loaded.loadLanguage(language as BundledLanguage);
  highlighter = loaded;
  return true;
};

/**
 * Splits `code` into lines of tokens whose light and dark colors are the CSS
 * variables `--shiki-light` and `--shiki-dark`. Returns null until
 * {@link loadCodeLanguage} has loaded the language, and for very long code.
 */
export const tokenizeCode = (code: string, language: string): ThemedToken[][] | null => {
  if (!highlighter?.getLoadedLanguages().includes(language)) return null;
  if (code.length > MAX_HIGHLIGHTED_CHARS) return null;
  return highlighter.codeToTokens(code, {
    lang: language as BundledLanguage,
    themes: THEMES,
    defaultColor: false,
  }).tokens;
};
