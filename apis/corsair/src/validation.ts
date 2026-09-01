/**
 * Shared validation + error-normalization helpers for the Corsair sidecar.
 *
 * Kept in a separate module so they can be unit-tested without booting the
 * Express server or touching the database.
 */
import { ApiError } from "corsair/http";

/**
 * Validate a tool-call payload against a Corsair FormFieldSchema (from
 * getStructuredSchema). Returns a list of human-readable validation errors.
 */
export function validatePayload(schema: any, payload: any): string[] {
  const errors: string[] = [];
  if (!schema || schema.kind !== "object") return errors;
  const fields = schema.fields ?? {};
  for (const [name, field] of Object.entries<any>(fields)) {
    const value = payload?.[name];
    const required = field.optional !== true;
    if (required && (value === undefined || value === null || value === "")) {
      errors.push(`Missing required field '${name}'`);
      continue;
    }
    if (value === undefined || value === null) continue;
    switch (field.kind) {
      case "string":
        if (typeof value !== "string") errors.push(`Field '${name}' must be a string`);
        else if (Array.isArray(field.enum) && !field.enum.includes(value)) errors.push(`Field '${name}' has an invalid value`);
        break;
      case "number":
        if (typeof value !== "number" || Number.isNaN(value)) errors.push(`Field '${name}' must be a number`);
        break;
      case "boolean":
        if (typeof value !== "boolean") errors.push(`Field '${name}' must be a boolean`);
        break;
      case "array":
        if (!Array.isArray(value)) errors.push(`Field '${name}' must be an array`);
        break;
      case "object":
        if (typeof value !== "object" || value === null || Array.isArray(value)) errors.push(`Field '${name}' must be an object`);
        break;
    }
  }
  return errors;
}

/**
 * Normalize a provider error into a consistent, safe response shape. Never
 * includes the raw error object (which may carry credentials) in the response.
 */
export function normalizeInvokeError(err: any): { status: number; body: Record<string, unknown> } {
  if (err instanceof ApiError) {
    if (err.isRateLimitError()) {
      return {
        status: 429,
        body: { success: false, errorType: "rate_limited", retryable: true, retryAfterMs: err.retryAfter ?? null, error: "Provider rate limit exceeded" },
      };
    }
    if (err.status >= 500) {
      return {
        status: 502,
        body: { success: false, errorType: "provider_outage", retryable: true, error: "Provider returned an error" },
      };
    }
    if (err.status === 401 || err.status === 403) {
      return {
        status: 401,
        body: { success: false, errorType: "auth_failed", retryable: false, needsConnect: true, error: "Provider authentication failed" },
      };
    }
    return {
      status: err.status || 500,
      body: { success: false, errorType: "provider_error", retryable: false, error: err.message },
    };
  }
  return {
    status: 503,
    body: { success: false, errorType: "network_error", retryable: true, error: "Provider request failed" },
  };
}
