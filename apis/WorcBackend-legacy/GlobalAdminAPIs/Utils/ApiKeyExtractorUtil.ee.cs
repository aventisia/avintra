namespace GlobalAdminAPIs.Utils;

/// <summary>
/// A utility class to extract the API key from the HTTP request headers.
/// </summary>
public static class ApiKeyExtractorUtil
{
    // Constant for the header name where the API key is expected
    private const string ApiKeyHeaderName = "X-API-KEY";

    /// <summary>
    /// Attempts to retrieve the API key from the HTTP request headers.
    /// Returns the API key if found; otherwise, returns null.
    /// </summary>
    /// <param name="context">The current HTTP context containing request data.</param>
    /// <returns>The API key if found; otherwise, null.</returns>
    public static string? ExtractApiKey(HttpContext? context)
    {
        // Early exit if context is null
        if (context == null)
            return null;

        try
        {
            // Check if the API key is available in the request headers
            if (context.Request.Headers.TryGetValue(ApiKeyHeaderName, out var headerValue))
            {
                // Extract the API key from the header value
                string apiKey = headerValue.ToString();

                // Return the API key if it's not empty or just whitespace
                if (!string.IsNullOrWhiteSpace(apiKey))
                    return apiKey;
            }
        }
        catch
        {
            // Ignore exceptions and simply return null if something goes wrong
        }

        // Return null if the API key is not found or the value is invalid
        return null;
    }
}
