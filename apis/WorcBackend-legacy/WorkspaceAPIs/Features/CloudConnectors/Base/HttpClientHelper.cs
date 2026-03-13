namespace WorkspaceAPIs.Features.CloudConnectors;

public static class HttpClientHelper
{
    private static readonly HttpClient httpClient;

    static HttpClientHelper()
    {
        httpClient = new HttpClient();
        httpClient.Timeout = TimeSpan.FromSeconds(60);
    }

    public static async Task<JsonDocument?> GetAsync(string url, string? jwt = null, Dictionary<string, string>? headers = null)
    {
        return await ProcessAsync(HttpMethod.Get, url, jwt, null, headers);
    }

    public static async Task<JsonDocument?> PostAsync(string url, object content, string? jwt = null, Dictionary<string, string>? headers = null, string mediaType = "application/json")
    {
        return await ProcessAsync(HttpMethod.Post, url, jwt, content, headers, mediaType);
    }

    public static async Task<JsonDocument?> PutAsync(string url, object content, string? jwt = null, Dictionary<string, string>? headers = null, string mediaType = "application/json")
    {
        return await ProcessAsync(HttpMethod.Put, url, jwt, content, headers, mediaType);
    }

    public static async Task<JsonDocument?> PatchAsync(string url, object content, string? jwt = null, Dictionary<string, string>? headers = null, string mediaType = "application/json")
    {
        return await ProcessAsync(HttpMethod.Patch, url, jwt, content, headers, mediaType);
    }

    public static async Task<JsonDocument?> DeleteAsync(string url, string? jwt = null, Dictionary<string, string>? headers = null)
    {
        return await ProcessAsync(HttpMethod.Delete, url, jwt, null, headers);
    }

    public static async Task<JsonDocument?> ProcessAsync(
        HttpMethod httpMethod,
        string url,
        string? jwt = null,
        object? content = null,
        Dictionary<string, string>? headers = null,
        string mediaType = "application/json")
    {
        using (var request = new HttpRequestMessage(httpMethod, url))
        {
            // Set the Bearer token in Authorization header
            if (jwt != null)
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", jwt);

            // Add additional headers
            if (headers != null)
            {
                foreach (var kv in headers)
                {
                    request.Headers.Remove(kv.Key); // Remove if already exists
                    request.Headers.Add(kv.Key, kv.Value);
                }
            }

            // Handle application/json
            if (content != null && mediaType == "application/json")
                request.Content = new StringContent(JsonConvert.SerializeObject(content), Encoding.UTF8, "application/json");

            // Handle application/x-www-form-urlencoded
            if (content != null && mediaType == "application/x-www-form-urlencoded" && content is Dictionary<string, string> dictContent)
                request.Content = new FormUrlEncodedContent(dictContent);

            try
            {
                var response = await httpClient.SendAsync(request);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    try
                    {
                        return JsonDocument.Parse(responseContent);
                    }
                    catch (System.Text.Json.JsonException ex)
                    {
                        return JsonDocument.Parse($@"{{""statusCode"": {(int)response.StatusCode}, ""error"": ""Exception: {ex.Message.Replace("\"", "'")}""}}");
                    }
                }
                else
                {
                    return JsonDocument.Parse($@"{{""statusCode"": {(int)response.StatusCode}, ""error"": ""Exception: {responseContent.Replace("\"", "'")}""}}");
                }
            }
            catch (Exception ex)
            {
                return JsonDocument.Parse($@"{{""statusCode"": 500, ""error"": ""Exception: {ex.Message.Replace("\"", "'")}""}}");
            }
        }
    }

    public static async Task<byte[]?> GetByteArrayAsync(string url, string? jwt = null, Dictionary<string, string>? headers = null)
    {
        using (var request = new HttpRequestMessage(HttpMethod.Get, url))
        {
            if (jwt != null)
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", jwt);

            if (headers != null)
            {
                foreach (var kv in headers)
                {
                    request.Headers.Remove(kv.Key);
                    request.Headers.Add(kv.Key, kv.Value);
                }
            }

            try
            {
                var response = await httpClient.SendAsync(request);
                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadAsByteArrayAsync();
                }
                else
                {
                    // Optionally handle error responses
                    return null;
                }
            }
            catch
            {
                // Optionally handle exceptions
                return null;
            }
        }
    }
}