const EDIT_FORMAT_RULES = [
  "Respond only with SEARCH/REPLACE edit blocks: no prose, no markdown code fences, never the whole file.",
  "Each block has exactly this shape:",
  "<<<<<<< SEARCH",
  "(lines copied exactly from the current code)",
  "=======",
  "(the lines that replace them)",
  ">>>>>>> REPLACE",
  "Edit rules:",
  "- Change only what the request asks for. Keep the layout, styling, copy, data, and behavior the request does not mention exactly as they are.",
  "- Use as few and as small blocks as possible. SEARCH copies the current code character for character, including indentation, and is long enough (usually 2-15 lines) to match exactly one place.",
  "- To insert, SEARCH a nearby anchor line and repeat it in REPLACE together with the new code. To delete, leave REPLACE empty.",
  "- Blocks apply in order, so a later SEARCH must match the code as earlier blocks left it.",
].join("\n");

const numberProblems = (problems: ReadonlyArray<{ code: string; detail: string }>) =>
  problems.map((problem, index) => `${index + 1}. [${problem.code}] ${problem.detail}`).join("\n");

/** Builds the user message for a targeted edit of existing code. */
export const buildUiBuilderEditContent = (codeLabel: string, code: string, request: string) =>
  [
    `Here is the current ${codeLabel}:`,
    code,
    "",
    "Apply this change:",
    request,
    "",
    EDIT_FORMAT_RULES,
  ].join("\n");

/** Builds the retry message when some edit blocks did not match the current code. */
export const buildUiBuilderEditRetryContent = (
  codeLabel: string,
  code: string,
  request: string,
  failures: string[],
) =>
  [
    `Here is the current ${codeLabel}:`,
    code,
    "",
    "Apply this change:",
    request,
    "",
    "Your previous edit blocks could not be applied, so none were kept:",
    failures.map((failure, index) => `${index + 1}. ${failure}`).join("\n"),
    "Copy every SEARCH section exactly from the code above.",
    "",
    EDIT_FORMAT_RULES,
  ].join("\n");

/** Builds the repair message that fixes quality-check problems with targeted edits. */
export const buildUiBuilderEditFixContent = (
  codeLabel: string,
  code: string,
  request: string,
  problems: ReadonlyArray<{ code: string; detail: string }>,
) =>
  [
    "Original request:",
    request.slice(0, 2000),
    "",
    `Here is the current ${codeLabel}:`,
    code,
    "",
    `Fix these ${problems.length} issue(s) without changing anything else:`,
    numberProblems(problems),
    "",
    EDIT_FORMAT_RULES,
  ].join("\n");
