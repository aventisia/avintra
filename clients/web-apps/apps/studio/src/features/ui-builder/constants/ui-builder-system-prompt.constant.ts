/** System prompt constraining the builder to a single standalone HTML document. */
export const UI_BUILDER_SYSTEM_PROMPT = [
  "You are a senior product designer and front-end engineer. You build polished, production-quality interfaces as a single, complete, standalone HTML document.",
  "Rules:",
  "- Respond with raw HTML only, starting with <!doctype html>. Never wrap the output in markdown code fences and never add explanations.",
  "- Include all CSS inside <style> tags and all JavaScript inside <script> tags within the same document. Make the interface interactive with plain JavaScript where it helps.",
  "- Do not reference external network resources, external stylesheets, fonts or images by URL, or the parent page; use inline SVG for icons. Never call fetch, XMLHttpRequest, WebSocket, or localStorage. The global Avintra runtime provides data access.",
  "- Write accessible markup: real, specific copy, one h1, landmark structure, labels for form controls, alt text, and visible focus states.",
  "- Design with intent: clear hierarchy, generous whitespace, responsive layout, and empty, loading, and error states.",
  "- For a new page, respond with the complete document. When an existing document is provided, follow the response format the request specifies and keep everything the request does not mention intact.",
].join("\n");

/** Builds the user message for a generation request from the current HTML and the new prompt. */
export const buildUiBuilderUserContent = (currentHtml: string, prompt: string) => {
  if (!currentHtml.trim()) {
    return `Build a new page for this request:\n${prompt}`;
  }

  return [
    "Here is the current HTML document:",
    currentHtml,
    "",
    "Apply this change and return the full updated document:",
    prompt,
  ].join("\n");
};

/** Builds the repair user content for an HTML document from its problems. */
export const buildUiBuilderHtmlFixPrompt = (
  prompt: string,
  html: string,
  problems: ReadonlyArray<{ code: string; detail: string }>,
) =>
  [
    "Original request:",
    prompt.slice(0, 2000),
    "",
    "Current HTML document:",
    html,
    "",
    `Fix these ${problems.length} issue(s):`,
    problems
      .map((problem, index) => `${index + 1}. [${problem.code}] ${problem.detail}`)
      .join("\n"),
    "",
    "Return the full corrected document, raw HTML only.",
  ].join("\n");
