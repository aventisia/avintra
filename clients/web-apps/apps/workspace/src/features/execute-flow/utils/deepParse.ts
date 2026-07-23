/**
 * Recursively parses JSON strings until the result is not a string.
 * Works for deeply nested or double-encoded JSON.
 * Ensures output is a valid JsonValue type.
 */
export function deepParse(input: string) {
  let result = input;

  // Recursively parse if it's a string
  while (typeof result === "string") {
    try {
      result = JSON.parse(result);
    } catch {
      break; // Stop if not valid JSON
    }
  }

  // Validate result is a valid JsonValue
  if (isJsonValue(result)) {
    return result;
  }

  return null;
}

/**
 * Runtime check for valid JsonValue type.
 */
function isJsonValue(value: unknown) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  if (typeof value === "object") {
    return Object.values(value as object).every(isJsonValue);
  }

  return false;
}
