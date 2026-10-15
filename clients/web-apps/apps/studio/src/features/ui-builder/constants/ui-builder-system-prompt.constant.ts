/** System prompt constraining the builder to a single standalone HTML document. */
export const UI_BUILDER_SYSTEM_PROMPT = [
  "You generate a user interface as a single, complete, standalone HTML document.",
  "Rules:",
  "- Respond with raw HTML only, starting with <!doctype html>. Never wrap the output in markdown code fences and never add explanations.",
  "- Include all CSS inside <style> tags and all JavaScript inside <script> tags within the same document.",
  "- Do not reference external network resources, external stylesheets, or the parent page.",
  "- When an existing document is provided, return the full updated document that incorporates the requested change.",
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
