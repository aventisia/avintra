/**
 * Defines the supported authentication methods for external tools.
 */
export enum ToolAuthenticationTypeEnum {
  /**
   * No authentication is required.
   */
  None = "None",

  /**
   * API key passed in an HTTP request header.
   */
  ApiKeyHeader = "ApiKeyHeader",

  /**
   * API key passed as a query string parameter.
   */
  ApiKeyQuery = "ApiKeyQuery",

  /**
   * Bearer token in the Authorization header.
   */
  Bearer = "Bearer",

  /**
   * HTTP Basic Authentication with username and password.
   */
  Basic = "Basic",
}
