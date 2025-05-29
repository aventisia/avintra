/**
 * Safely parses a potentially double-encoded JSON string.
 *
 * Some APIs may return stringified JSON inside another JSON string.
 * This function handles that case by parsing up to two times.
 *
 * @param input - A JSON string, possibly double-encoded.
 * @returns The parsed object, or null if parsing fails.
 */
export function deepParse(input: string) {
  try {
    // First parse attempt
    let parsed = JSON.parse(input);

    // If the result is still a string, try parsing again
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed);
    }

    // Return the fully parsed object with expected type
    return parsed;
  } catch (error) {
    // Log error and return null on any parsing failure
    console.error("Failed to parse JSON string:", error);
    return null;
  }
}
