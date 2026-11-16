const OUTLINE_LINE_CAP = 40;
const OUTLINE_TEXT_CAP = 80;

const clip = (value: string | null | undefined) =>
  (value ?? "").replace(/\s+/g, " ").trim().slice(0, OUTLINE_TEXT_CAP);

/**
 * Summarizes rendered markup as a short outline (landmarks, headings, and control counts) that
 * small model calls can reason about without the full source.
 */
export const extractUiBuilderOutline = (markup: string): string => {
  if (!markup.trim()) return "";
  const document = new DOMParser().parseFromString(markup, "text/html");
  const lines: string[] = [];

  document.querySelectorAll("header, nav, main, aside, footer, h1, h2, h3").forEach((element) => {
    const tag = element.tagName.toLowerCase();
    if (/^h[1-3]$/.test(tag)) {
      const text = clip(element.textContent);
      if (text) lines.push(`${"  ".repeat(Number(tag[1]) - 1)}${tag}: ${text}`);
    } else {
      lines.push(`[${tag}]`);
    }
  });

  const count = (selector: string) => document.querySelectorAll(selector).length;
  lines.push(
    `controls: ${count("button")} buttons, ${count("input, select, textarea")} fields, ${count("table")} tables, ${count("form")} forms, ${count("svg")} svgs, ${count("[role=dialog], dialog")} dialogs`,
  );

  return lines.slice(-OUTLINE_LINE_CAP).join("\n");
};
