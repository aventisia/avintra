/**
 * Represents a request to test a tool operation via the .NET Workspace API.
 */
export interface TestToolDto {
  /**
   * Base URL of the tool.
   */
  baseUrl: string;

  /**
   * Identifier of the operation to execute.
   */
  operationId: string;

  /**
   * Input parameters for the operation.
   */
  parameters?: Record<string, unknown>;

  /**
   * Optional credential NAME override.
   */
  credentialName?: string;

  /**
   * OpenAPI specification of the tool.
   */
  openApiSpec?: string;
}

/**
 * Represents the response from a tool test call.
 *
 * The wire keys are snake_case because both producers emit them as-is: the
 * Python LLM pipeline returns its Pydantic field names (`status_code`,
 * `duration_ms`), and the Workspace API pins the same names via
 * `[JsonPropertyName]` on `TestToolResponseDto`. The frontend talks to both
 * ends, so the interface mirrors the wire contract.
 */
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
