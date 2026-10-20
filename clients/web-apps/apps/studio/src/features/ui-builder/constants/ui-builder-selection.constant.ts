import { type UiBuilderSelection } from "../types/ui-builder-selection.type";

/** `source` field stamped on every message the other bridge script posts to the studio. */
export const UI_BUILDER_BRIDGE_SOURCE = "ui-builder-bridge";

/** `type` field stamped on the element-selection message the bridge script posts. */
export const UI_BUILDER_SELECTION_MESSAGE_TYPE = "ui-builder:select";

/** Maximum number of outerHTML characters appended to a generation prompt for one selection. */
export const UI_BUILDER_OUTER_HTML_CAP = 2000;

/** Maximum number of characters kept per side of a manual text-edit marker prompt. */
export const UI_BUILDER_EDIT_TEXT_CAP = 200;

const truncateEditSnippet = (value: string) =>
  value.length > UI_BUILDER_EDIT_TEXT_CAP ? `${value.slice(0, UI_BUILDER_EDIT_TEXT_CAP)}…` : value;

/** Builds the delimited selection block appended to the LLM prompt when sending with a selection. */
export const buildUiBuilderSelectionBlock = (selection: UiBuilderSelection): string => {
  const isCapped = selection.outerHtml.length > UI_BUILDER_OUTER_HTML_CAP;
  const outerHtml = isCapped
    ? selection.outerHtml.slice(0, UI_BUILDER_OUTER_HTML_CAP)
    : selection.outerHtml;

  return [
    "Selected element:",
    `Selector: ${selection.selector}`,
    ...(selection.sourceTag ? [`Source JSX tag: ${selection.sourceTag}`] : []),
    "HTML:",
    outerHtml,
    ...(isCapped ? ["…(truncated)"] : []),
  ].join("\n");
};

/** Builds the marker promptText stored for a manual text edit version. */
export const buildUiBuilderTextEditPrompt = (
  selector: string,
  previousText: string,
  nextText: string,
): string =>
  `Manual text edit (${selector}): "${truncateEditSnippet(previousText)}" → "${truncateEditSnippet(nextText)}"`;
