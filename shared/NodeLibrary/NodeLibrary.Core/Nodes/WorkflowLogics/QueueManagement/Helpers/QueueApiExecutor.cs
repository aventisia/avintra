using System.Net;
using NodeLibrary.Helpers;

namespace NodeLibrary.QueueManagementNodes.Helpers;

/// <summary>
/// Utility class for executing HTTP requests against Queue Management APIs.
/// </summary>
public static class QueueApiExecutor
{
    private static readonly HttpClient _httpClient = new();
    private static readonly JsonSerializerOptions _camelCaseOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    /// <summary>
    /// Executes an HTTP request to the specified Queue Management API endpoint.
    /// </summary>
    public static async Task<JsonElement> ExecuteAsync(
        string baseUrl,
        string endpoint,
        HttpMethod method,
        string accessToken,
        object? payload = null,
        string? envType = null)
    {
        if (string.IsNullOrWhiteSpace(baseUrl))
            throw new ArgumentNullException(nameof(baseUrl));

        if (string.IsNullOrWhiteSpace(endpoint))
            throw new ArgumentNullException(nameof(endpoint));

        if (string.IsNullOrWhiteSpace(accessToken))
            throw new ArgumentNullException(nameof(accessToken));

        var requestUri = $"{baseUrl.TrimEnd('/')}/{endpoint.TrimStart('/')}";

        using var request = new HttpRequestMessage(method, requestUri);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        NodeHttpHeaders.ApplyEnvHeader(request, envType);

        if (method != HttpMethod.Get && method != HttpMethod.Delete && payload != null)
        {
            var requestJson = JsonSerializer.Serialize(payload, _camelCaseOptions);
            request.Content = new StringContent(requestJson, Encoding.UTF8, "application/json");
        }

        var response = await _httpClient.SendAsync(request);
        var responseContent = await response.Content.ReadAsStringAsync();

        // Read the body before deciding success: the backend returns handled failures
        // (e.g. "Queue workitem not found.") as a ServiceResponse envelope with a non-200
        // statusCode. Surfacing that message beats a generic "400 (Bad Request)".
        var statusCode = (int)response.StatusCode;
        string? message = null;

        if (!string.IsNullOrWhiteSpace(responseContent))
        {
            try
            {
                using var responseDoc = JsonDocument.Parse(responseContent);
                var responseRoot = responseDoc.RootElement;

                if (responseRoot.TryGetProperty("statusCode", out var scEl) &&
                    scEl.ValueKind == JsonValueKind.Number)
                {
                    statusCode = scEl.GetInt32();
                }

                if (responseRoot.TryGetProperty("message", out var msgEl))
                    message = msgEl.GetString();
            }
            catch (JsonException)
            {
                // Non-JSON body (e.g. plain-text middleware/nginx error) — keep HTTP status.
                // Surface a short plain-text body (e.g. the backend's handled error
                // messages like "No available work items found." or "This queue does
                // not support automatic next-item claiming.") instead of a generic
                // "400 (Bad Request)".
                if (string.IsNullOrWhiteSpace(message) &&
                    responseContent.Length <= 255 &&
                    !responseContent.Contains('<'))
                {
                    message = responseContent.Trim();
                }
            }
        }

        if (statusCode < 200 || statusCode >= 300)
        {
            throw new HttpRequestException(
                message ?? $"Request failed with status code {(int)response.StatusCode} ({(int)response.StatusCode}).",
                null,
                (HttpStatusCode)statusCode);
        }

        using var doc = JsonDocument.Parse(responseContent);
        return doc.RootElement.TryGetProperty("data", out var dataEl)
            ? dataEl.Clone()
            : doc.RootElement.Clone();
    }

    /// <summary>
    /// Converts a text value (e.g. an ISO 8601 string or a free-form datetime) into a
    /// <see cref="DateTimeOffset"/>. Returns null when the value is null/whitespace or cannot be parsed.
    /// </summary>
    public static DateTimeOffset? ConvertToDateTimeOffset(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        if (DateTimeOffset.TryParse(
                value.Trim(),
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.RoundtripKind,
                out var parsed))
        {
            return parsed;
        }

        return null;
    }
}
