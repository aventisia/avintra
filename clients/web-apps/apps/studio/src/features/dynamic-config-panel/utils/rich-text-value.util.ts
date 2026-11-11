import { generateHTML, generateJSON } from "@tiptap/react";

import { richTextExtensions } from "../constants/rich-text-extensions.constant";

const escapedPlaceholderEntities: Record<string, string> = {
  "&lt;": "<",
  "&gt;": ">",
  "&amp;": "&",
};

const unescapePlaceholders = (html: string) =>
  html.replace(/\{\{[\s\S]*?\}\}/g, (placeholder) =>
    placeholder.replace(/&(lt|gt|amp);/g, (entity) => escapedPlaceholderEntities[entity]),
  );

/**
 * Converts editor HTML into the stored field value: empty for an empty editor, plain text for a
 * lone unformatted paragraph, and `{{…}}` expressions left unescaped for the template resolver.
 */
export const toStoredRichTextValue = (html: string) => {
  if (html === "<p></p>") return "";
  const stored = unescapePlaceholders(html);
  return /^<p>[^<&]*<\/p>$/.test(stored) ? stored.slice(3, -4) : stored;
};

/**
 * Whether the visual editor can load the value and store it back unchanged.
 */
export const survivesVisualEditing = (value: string) =>
  !value ||
  toStoredRichTextValue(
    generateHTML(generateJSON(value, richTextExtensions), richTextExtensions),
  ) === value;
