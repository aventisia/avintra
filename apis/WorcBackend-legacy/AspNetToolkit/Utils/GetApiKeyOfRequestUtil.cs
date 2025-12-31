namespace AspNetToolkit.Utils;

public static class GetApiKeyOfRequestUtil
{
    private const string ApiKeyHeaderName = "X-API-KEY";

    /// <summary>
    /// Attempts to retrieve the API key from the HTTP request headers.
    /// </summary>
    /// <param name="context">The current HTTP context.</param>
    /// <returns>The API key if found; otherwise, null.</returns>
    public static string? GetApiKeyOfRequest(HttpContext? context)
    {
        try
        {
            if (context == null)
                return null;

            // Try to get API key from header
            if (context.Request.Headers.TryGetValue(ApiKeyHeaderName, out var headerValue))
            {
                var apiKey = headerValue.ToString();
                if (!string.IsNullOrWhiteSpace(apiKey))
                    return apiKey;
            }
        }
        catch
        {
            // ignore exceptions, just return null
        }

        return null;
    }
}
