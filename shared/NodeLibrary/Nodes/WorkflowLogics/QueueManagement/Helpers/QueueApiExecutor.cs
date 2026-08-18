using System.Net;

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
        object? payload = null)
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

        if (method != HttpMethod.Get && method != HttpMethod.Delete && payload != null)
        {
            var requestJson = JsonSerializer.Serialize(payload, _camelCaseOptions);
            request.Content = new StringContent(requestJson, Encoding.UTF8, "application/json");
        }

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var responseContent = await response.Content.ReadAsStringAsync();

        using var responseDoc = JsonDocument.Parse(responseContent);
        var responseRoot = responseDoc.RootElement;

        var statusCode = responseRoot.TryGetProperty("statusCode", out var scEl)
            ? scEl.GetInt32()
            : (int)response.StatusCode;

        if (statusCode != 200)
        {
            var message = responseRoot.TryGetProperty("message", out var msgEl)
                ? msgEl.GetString()
                : "Request failed.";

            throw new HttpRequestException(message, null, (HttpStatusCode)statusCode);
        }

        return responseRoot.TryGetProperty("data", out var dataEl)
            ? dataEl.Clone()
            : responseRoot.Clone();
    }
}
