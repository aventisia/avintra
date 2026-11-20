using System.Net;

namespace NodeLibrary.CloudConnectorNodes;

/// <summary>
/// Builds the execution-log status for a failed cloud-connector request, keeping the service's reason.
/// </summary>
public static class ConnectorNodeErrors
{
    private const int MaxDetailLength = 500;

    /// <summary>
    /// Builds the execution-log status, naming <paramref name="sourceLabel"/> as the request source.
    /// </summary>
    public static string BuildErrorStatus(HttpStatusCode statusCode, string? responseContent, string sourceLabel = "Connector")
    {
        var detail = NodeLogHelper.ScrubSecretPatterns(ExtractErrorDetail(responseContent));
        if (detail.Length > MaxDetailLength)
        {
            detail = detail[..MaxDetailLength] + "...";
        }
        return string.IsNullOrWhiteSpace(detail)
            ? $"Error: {sourceLabel} request failed with HTTP {(int)statusCode} ({statusCode})."
            : $"Error: {sourceLabel} request failed with HTTP {(int)statusCode} ({statusCode}): {detail}";
    }

    private static string? ExtractErrorDetail(string? responseContent)
    {
        if (string.IsNullOrWhiteSpace(responseContent))
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(responseContent);
            var root = document.RootElement;
            var error = GetString(root, "error") ?? GetNestedString(root, "data", "error");
            var details = GetString(root, "details") ?? GetNestedString(root, "data", "details");
            var message = GetString(root, "message");
            var detail = string.Join("; ", new[] { error, details, message }.Where(value => !string.IsNullOrWhiteSpace(value)).Distinct());
            return string.IsNullOrWhiteSpace(detail) ? null : detail;
        }
        catch (JsonException)
        {
            return responseContent.Trim();
        }
    }

    private static string? GetString(JsonElement element, string propertyName) =>
        element.TryGetProperty(propertyName, out var property) && property.ValueKind == JsonValueKind.String
            ? property.GetString()
            : null;

    private static string? GetNestedString(JsonElement element, string parentName, string propertyName) =>
        element.TryGetProperty(parentName, out var parent) && parent.ValueKind == JsonValueKind.Object
            ? GetString(parent, propertyName)
            : null;
}
