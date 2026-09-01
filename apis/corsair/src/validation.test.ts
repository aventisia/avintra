/**
 * Unit tests for the Corsair sidecar validation + error-normalization helpers.
 *
 * These cover the non-happy-path cases that matter for security and reliability:
 *   - malformed / missing tool input (payload validation)
 *   - rate-limited, provider-outage, auth-failed, and network errors
 *   - credential-not-provided (AuthMissingError) is handled in the invoke handler
 *
 * Usage:
 *   npm run test:validation
 */
import { ApiError } from "corsair/http";
import { validatePayload, normalizeInvokeError } from "./validation.js";

function assert(cond: boolean, message: string): void {
  if (!cond) throw new Error(`ASSERTION FAILED: ${message}`);
}

// --- validatePayload ---

const schema = {
  kind: "object",
  fields: {
    owner: { kind: "string", optional: false },
    repo: { kind: "string", optional: false },
    issueNumber: { kind: "number", optional: false },
    labels: { kind: "array", optional: true },
    state: { kind: "string", optional: true, enum: ["open", "closed"] },
    meta: { kind: "object", optional: true },
  },
};

function testValidatePayload(): void {
  // Happy path: valid payload passes.
  assert(
    validatePayload(schema, { owner: "a", repo: "b", issueNumber: 1 }).length === 0,
    "valid payload should pass",
  );

  // Missing required field.
  const missing = validatePayload(schema, { owner: "a" });
  assert(missing.some((e) => e.includes("repo")), "missing required field should be reported");
  assert(missing.some((e) => e.includes("issueNumber")), "missing required field should be reported");

  // Wrong type.
  assert(
    validatePayload(schema, { owner: "a", repo: "b", issueNumber: "not-a-number" }).some((e) => e.includes("issueNumber")),
    "wrong type should be reported",
  );

  // Enum violation.
  assert(
    validatePayload(schema, { owner: "a", repo: "b", issueNumber: 1, state: "bogus" }).some((e) => e.includes("state")),
    "enum violation should be reported",
  );

  // Array / object type checks.
  assert(
    validatePayload(schema, { owner: "a", repo: "b", issueNumber: 1, labels: "not-array" }).some((e) => e.includes("labels")),
    "non-array for array field should be reported",
  );
  assert(
    validatePayload(schema, { owner: "a", repo: "b", issueNumber: 1, meta: [] }).some((e) => e.includes("meta")),
    "array for object field should be reported",
  );

  // Null schema → no errors (defensive).
  assert(validatePayload(null, {}) .length === 0, "null schema should not throw");

  console.log("PASS: validatePayload");
}

// --- normalizeInvokeError ---

function makeApiError(status: number, opts: { retryAfter?: number } = {}): ApiError {
  // ApiError constructor: (request, response, message, rateLimitInfo)
  return new ApiError(
    { url: "https://api.example.com/x", method: "GET" } as any,
    { url: "https://api.example.com/x", status, statusText: "status", body: {} } as any,
    "provider error",
    opts.retryAfter !== undefined ? { retryAfter: opts.retryAfter } : undefined,
  );
}

function testNormalizeInvokeError(): void {
  // Rate limit (429).
  const rate = normalizeInvokeError(makeApiError(429, { retryAfter: 5000 }));
  assert(rate.status === 429, "rate limit should map to 429");
  assert(rate.body.errorType === "rate_limited", "rate limit errorType");
  assert(rate.body.retryable === true, "rate limit retryable");
  assert(rate.body.retryAfterMs === 5000, "rate limit retryAfterMs");

  // Provider outage (5xx).
  const outage = normalizeInvokeError(makeApiError(503));
  assert(outage.status === 502, "provider outage should map to 502");
  assert(outage.body.errorType === "provider_outage", "provider outage errorType");
  assert(outage.body.retryable === true, "provider outage retryable");

  // Auth failure (401/403).
  const auth = normalizeInvokeError(makeApiError(401));
  assert(auth.status === 401, "auth failure should map to 401");
  assert(auth.body.errorType === "auth_failed", "auth failure errorType");
  assert(auth.body.needsConnect === true, "auth failure needsConnect");

  // Generic provider error (4xx).
  const generic = normalizeInvokeError(makeApiError(400));
  assert(generic.status === 400, "generic provider error status");
  assert(generic.body.errorType === "provider_error", "generic provider errorType");

  // Network error (non-ApiError).
  const network = normalizeInvokeError(new Error("ECONNRESET"));
  assert(network.status === 503, "network error should map to 503");
  assert(network.body.errorType === "network_error", "network error errorType");
  assert(network.body.retryable === true, "network error retryable");

  // Critical: the normalized body must never contain the raw error object
  // (which can carry the Authorization header / request body with credentials).
  const raw = makeApiError(500);
  (raw as any).request = { headers: { Authorization: "Bearer secret-token" } };
  const normalized = normalizeInvokeError(raw);
  const serialized = JSON.stringify(normalized.body);
  assert(!serialized.includes("secret-token"), "normalized body must not leak credentials");

  console.log("PASS: normalizeInvokeError");
}

function main(): void {
  testValidatePayload();
  testNormalizeInvokeError();
  console.log("ALL VALIDATION TESTS PASSED");
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
