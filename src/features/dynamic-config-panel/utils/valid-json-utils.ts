export function stringifyIfValidJson(value: unknown): unknown {
  // If it's not a string, return it as is
  if (typeof value !== "string") return value;

  // Try to parse the string as JSON. If it succeeds, return the stringified version of the parsed object.
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "object" && parsed !== null) {
      return JSON.stringify(parsed);
    }
    // If parsed is not object/array, return original string
    return value;
  } catch {
    // If not valid JSON, return original string
    return value;
  }
}

export function parseIfValidJson(value: unknown): unknown {
  // If it's not a string, return it as is
  if (typeof value !== "string") return value;

  // Try to parse the string as JSON. If it succeeds and is object/array, return the parsed object/array.
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed;
    }
    // If parsed is not object/array, return original string
    return value;
  } catch {
    // If not valid JSON, return original string
    return value;
  }
}
