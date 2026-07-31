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
   * Optional credential identifier override.
   */
  credentialId?: string;
}

/**
 * Represents the response from a tool test call.
 */
export interface TestToolResponseDto {
  /**
   * Indicates whether the test request succeeded.
   */
  success: boolean;

  /**
   * HTTP status code returned by the test call.
   */
  statusCode?: number;

  /**
   * Response body returned by the test call.
   */
  body?: unknown;

  /**
   * Duration of the test call in milliseconds.
   */
  durationMs?: number;
}
