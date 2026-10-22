using System.Net;
using NodeLibrary.Helpers;

namespace NodeLibrary.SubFlowNodes.Helpers;

/// <summary>
/// Utility class for executing HTTP requests against the job execution APIs.
/// </summary>
public static class JobApiExecutor
{
    private static readonly HttpClient _httpClient = new();
    private static readonly JsonSerializerOptions _camelCaseOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    /// <summary>
    /// Executes an HTTP request to the specified job execution API endpoint and returns its data payload.
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
                // IMPORTANT NOTE: the backend and proxies may answer with plain text, so a short non-HTML body is the only failure detail available.
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
}
