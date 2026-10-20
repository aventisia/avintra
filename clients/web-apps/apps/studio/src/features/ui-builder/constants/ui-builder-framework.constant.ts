import { UI_BUILDER_KIT_REFERENCE } from "../kit/kit-reference.constant";

/** Output format of a custom UI builder version. */
export type UiBuilderContentFormat = "html" | "framework";

/** Platform skills injected on every framework generation pass. */
export const UI_BUILDER_FRAMEWORK_SKILL_NAMES = ["ui-design-system", "ui-a11y-review"] as const;

/** Platform skill with reference page compositions, injected only when drafting a new interface. */
export const UI_BUILDER_ARCHETYPE_SKILL_NAME = "ui-page-archetypes";

/** Platform skill with chart and KPI guidance, injected when the interface has data connections. */
export const UI_BUILDER_DATA_VIZ_SKILL_NAME = "ui-data-viz";

/** Maximum characters accepted for a framework JSX source. */
export const UI_BUILDER_SOURCE_CAP = 120000;

/** Maximum characters accepted for a generated HTML document. */
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

/** Builds the system prompt constraining the builder to one interactive React component on the runtime kit. */
export const buildUiBuilderFrameworkSystemPrompt = (themeDescription: string) =>
  [
    "You are a senior product designer and React engineer. You build polished, production-quality internal business interfaces as a single React function component written in JSX.",
    "The component runs live in the browser with React 18, so state, effects, and event handlers all work: make the interface genuinely interactive (tabs, filters, forms with validation, dialogs, optimistic feedback).",
    "Rules:",
    "- Respond with raw component code only: no markdown code fences and no explanations.",
    "- Export exactly one default function component and no other exports. You may declare helper components and constants above it.",
    "- Do not use import or export-from statements, require, or dynamic imports. React and its hooks are on the React namespace (for example React.useState, React.useMemo). The globals UI, Charts, Icons, and Avintra are always available.",
    "- Build with the runtime kit below wherever a component fits, and style layout and details with Tailwind v4 utility classes in className. Use the theme tokens for color so the project theme applies; use the style prop only for values Tailwind cannot express.",
    "- Do not reference external network resources, external stylesheets, images by URL, fonts by URL, or the parent page. Never call fetch, XMLHttpRequest, WebSocket, eval, or localStorage.",
    "- Write accessible markup: real, specific copy (no lorem ipsum), exactly one h1 (UI.PageHeader renders it), landmark structure (header or main), labels for every form control, aria-labels on icon-only buttons, and visible focus states.",
    "- Design with intent: clear hierarchy, dense-but-calm layouts suited to daily operational use, consistent spacing, responsive layouts (sm/md/lg), tabular numbers, and loading, empty, and error states.",
    `- Project theme: ${themeDescription}. The kit and tokens already follow it.`,
    "- For a new interface, respond with the complete component. When existing source is provided, follow the response format the request specifies and keep everything the request does not mention intact.",
    "",
    UI_BUILDER_KIT_REFERENCE,
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

/** Builds the user message that rebuilds the current interface in the other output format. */
export const buildUiBuilderConversionContent = (
  targetFormat: UiBuilderContentFormat,
  currentCode: string,
  prompt: string,
) => {
  const sourceLabel = targetFormat === "framework" ? "HTML document" : "React component";
  const targetLabel =
    targetFormat === "framework"
      ? "a React function component that follows the rules"
      : "a standalone HTML document that follows the rules";

  return [
    `Here is the current interface as a ${sourceLabel}:`,
    currentCode,
    "",
    `Rebuild it as ${targetLabel}, preserving its content, layout, and behavior, and apply this request:`,
    prompt,
  ].join("\n");
};
