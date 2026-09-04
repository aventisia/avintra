namespace WorkspaceAPIs.Features.CloudConnectors.Camel;

/// <summary>
/// Result of building the authentication block for a Camel connector request.
/// The <see cref="Auth"/> dictionary uses the flat auth keys consumed by the
/// harness envelope (<c>type</c>, <c>token</c>, <c>username</c>, <c>password</c>,
/// <c>tenantId</c>, <c>clientId</c>, <c>clientSecret</c>, <c>properties</c>).
/// </summary>
public class CamelAuthResult
{
    /// <summary>Whether authentication was resolved successfully.</summary>
    public bool IsSuccess { get; init; }

    /// <summary>HTTP status code to surface when <see cref="IsSuccess"/> is false.</summary>
    public int StatusCode { get; init; }

    /// <summary>User-facing error message when <see cref="IsSuccess"/> is false.</summary>
    public string? ErrorMessage { get; init; }

    /// <summary>Flat auth dictionary merged into the harness request envelope.</summary>
    public Dictionary<string, object?>? Auth { get; init; }

    public static CamelAuthResult None() => new()
    {
        IsSuccess = true,
        StatusCode = 200,
        Auth = new Dictionary<string, object?> { ["type"] = "none" }
    };

    public static CamelAuthResult Success(Dictionary<string, object?> auth) => new()
    {
        IsSuccess = true,
        StatusCode = 200,
        Auth = auth
    };

    public static CamelAuthResult Failure(int statusCode, string errorMessage) => new()
    {
        IsSuccess = false,
        StatusCode = statusCode,
        ErrorMessage = errorMessage
    };
}
