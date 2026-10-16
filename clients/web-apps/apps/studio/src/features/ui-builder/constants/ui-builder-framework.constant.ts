import { UI_BUILDER_FRAMEWORK_TOKEN_SUMMARY } from "./ui-builder-framework-tokens.constant";

/** Output format of a custom UI builder version. */
export type UiBuilderContentFormat = "html" | "framework";

/** Platform skills injected on every framework generation pass. */
export const UI_BUILDER_FRAMEWORK_SKILL_NAMES = ["ui-design-system", "ui-a11y-review"] as const;

/** Maximum characters accepted for a framework JSX source. */
export const UI_BUILDER_SOURCE_CAP = 120000;

/** Maximum characters accepted for a framework built document. */
export const UI_BUILDER_BUILT_CAP = 300000;

/** Maximum characters of the original prompt embedded in the fix pass. */
export const UI_BUILDER_FIX_PROMPT_CAP = 2000;

/** Maximum number of validator violations reported for one pass. */
export const UI_BUILDER_MAX_VIOLATIONS = 10;

/** Maximum characters kept per validator violation detail. */
export const UI_BUILDER_VIOLATION_DETAIL_CAP = 500;

/** Note appended to a selection block so the model edits the source, not the rendered output. */
export const UI_BUILDER_FRAMEWORK_SELECTION_NOTE =
  "Note: the selection below is rendered output; apply the change to the JSX source.";

/** System prompt constraining the builder to one React function component. */
export const UI_BUILDER_FRAMEWORK_SYSTEM_PROMPT = [
  "You generate a user interface as a single React function component written in JSX.",
  "Rules:",
  "- Respond with raw component code only. It must start with `export default function` and contain no markdown code fences and no explanations.",
  "- Export exactly one default function component and no other exports.",
  "- Do not use import or export-from statements, require, or dynamic imports. React and its hooks are available on the React namespace (for example React.useState).",
  "- Use JSX with className attributes and Tailwind utility classes only, chosen from the design-system families: layout and display, flex, grid, spacing, typography, color, radius, shadow, and state variants.",
  "- Do not reference external network resources, external stylesheets, URLs, or the parent page.",
  "- Write accessible markup: real specific copy, a heading, a landmark structure, labels for form controls, alt text on images, and visible focus states.",
  `- Follow the platform design tokens: ${UI_BUILDER_FRAMEWORK_TOKEN_SUMMARY}.`,
  "- When existing source is provided, return the full updated component that incorporates the requested change.",
].join("\n");

/** Builds the user message for a framework request from the current source and the new prompt. */
export const buildUiBuilderFrameworkUserContent = (
  source: string,
  prompt: string,
  selectionBlock = "",
) => {
  const request = selectionBlock ? `${prompt}\n\n${selectionBlock}` : prompt;

  if (!source.trim()) {
    return `Build a new interface for this request:\n${request}`;
  }

  return [
    "Here is the current JSX source:",
    source,
    "",
    "Apply this change and return the full updated source:",
    request,
  ].join("\n");
};

/** Builds the fix-pass user content from the original prompt, the draft source, and the violations. */
export const buildUiBuilderFixPrompt = (
  prompt: string,
  source: string,
  violations: ReadonlyArray<{ code: string; detail: string }>,
) => {
  const cappedPrompt =
    prompt.length > UI_BUILDER_FIX_PROMPT_CAP ? prompt.slice(0, UI_BUILDER_FIX_PROMPT_CAP) : prompt;
  const numberedViolations = violations
    .map((violation, index) => `${index + 1}. [${violation.code}] ${violation.detail}`)
    .join("\n");

  return [
    "Original request:",
    cappedPrompt,
    "",
    "Current JSX source:",
    source,
    "",
    `Fix these ${violations.length} issue(s):`,
    numberedViolations,
    "",
    "Return the full corrected source, raw code only.",
  ].join("\n");
};
