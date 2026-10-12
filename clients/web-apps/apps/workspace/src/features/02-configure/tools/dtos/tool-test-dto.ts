/**
 * Represents a request to test a tool operation.
 */
export interface TestToolDto {
  /**
   * Identifier of the operation to execute.
   */
  operationId: string;

  /**
   * Input parameters for the operation.
   */
  parameters?: Record<string, unknown>;

  /**
   * Optional credential name override.
   */
  credentialName?: string;
}

/**
 * Represents the response from a tool test call.
 */
// IMPORTANT NOTE: the wire keys are snake_case because both producers emit them as-is; the Workspace API pins the names via [JsonPropertyName] and the Python pipeline returns its Pydantic field names.
export interface TestToolResponseDto {
  /**
   * Indicates whether the test request succeeded.
   */
  success: boolean;

  /**
   * HTTP status code returned by the test call.
   */
  status_code?: number;

  /**
   * Response body returned by the test call.
   */
  body?: unknown;

  /**
   * Duration of the test call in milliseconds.
   */
  duration_ms?: number;
}
