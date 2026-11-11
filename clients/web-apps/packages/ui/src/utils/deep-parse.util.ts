/**
 * Parses a possibly multi-encoded JSON string until it is no longer a string; returns null for non-JSON values.
 */
export function deepParse(input: string) {
  let result = input;

  while (typeof result === "string") {
    try {
      result = JSON.parse(result);
    } catch {
      break;
    }
  }

  if (isJsonValue(result)) {
    return result;
  }

  return null;
}

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
