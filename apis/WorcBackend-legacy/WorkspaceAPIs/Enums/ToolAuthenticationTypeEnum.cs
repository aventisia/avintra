namespace WorkspaceAPIs.Enums;

/// <summary>
/// Defines the supported authentication methods for external tools and APIs.
/// </summary>
public enum ToolAuthenticationTypeEnum
{
    /// <summary>
    /// No authentication is required.
    /// </summary>
    [Description("No authentication")]
    None,

    /// <summary>
    /// Authentication using an API key passed in an HTTP request header.
    /// </summary>
    [Description("API Key (Header)")]
    ApiKeyHeader,

    /// <summary>
    /// Authentication using an API key passed as a query string parameter.
    /// </summary>
    [Description("API Key (Query)")]
    ApiKeyQuery,

    /// <summary>
    /// Authentication using an HTTP Bearer token in the Authorization header.
    /// </summary>
    [Description("Bearer Token")]
    Bearer,

    /// <summary>
    /// Authentication using HTTP Basic Authentication with a username and password.
    /// </summary>
    [Description("Basic Authentication")]
    Basic,
}