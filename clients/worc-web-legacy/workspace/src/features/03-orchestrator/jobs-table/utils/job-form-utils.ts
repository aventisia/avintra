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

/**
 * Extracts a string identifier from an async single-select field value.
 *
 * Async single-select fields may store the full selected DTO object at runtime,
 * while unselected fields are represented as an empty string or undefined.
 *
 * @param value - The watched form field value.
 * @param idKey - The property name of the identifier on the selected DTO.
 * @returns The trimmed identifier string, or null when unavailable.
 */
const getSelectedId = (value: unknown, idKey: string): string | null => {
  if (value == null) return null;
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "object" && idKey in value) {
    const id = (value as Record<string, unknown>)[idKey];
    return typeof id === "string" ? id.trim() || null : null;
  }
  return null;
};

export { parseJsonEditorValue, getSelectedId };
