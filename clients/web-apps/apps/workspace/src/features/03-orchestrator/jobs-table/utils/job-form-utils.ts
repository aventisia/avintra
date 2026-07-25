/**
 * Parses a JSON string from the JSON editor into a record object.
 *
 * @param value - The JSON string to parse.
 * @returns The parsed record, or undefined if the value is empty or invalid.
 */
const parseJsonEditorValue = (value?: string): Record<string, unknown> | undefined => {
  if (!value || value.trim() === "") return undefined;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return undefined;
  }
};

export { parseJsonEditorValue };
