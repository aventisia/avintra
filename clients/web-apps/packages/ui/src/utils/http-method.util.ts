const BODY_CAPABLE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Indicates whether an HTTP method can carry a JSON request body.
 */
export const isBodyCapableMethod = (method?: string): boolean =>
  BODY_CAPABLE_METHODS.has((method ?? "").toUpperCase());
