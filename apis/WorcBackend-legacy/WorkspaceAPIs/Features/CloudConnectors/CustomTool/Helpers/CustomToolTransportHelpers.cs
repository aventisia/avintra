namespace WorkspaceAPIs.Features.CloudConnectors.CustomTool.Helpers;

/// <summary>
/// Sends a custom-tool HTTP request under the 30-second timeout and 5 MB response cap.
/// </summary>
public static class CustomToolTransportHelpers
{
    private static readonly TimeSpan RequestTimeout = TimeSpan.FromSeconds(30);
    private const long MaxResponseBytes = 5 * 1024 * 1024;
    private const int BadGatewayStatusCode = 502;
    private const int GatewayTimeoutStatusCode = 504;

    /// <summary>
    /// Sends the proxied request and returns the upstream status code, raw body
    /// text and an error message when the call could not be completed.
    /// </summary>
    public static async Task<(int StatusCode, string Body, string? Error)> SendAsync(
        IHttpClientFactory httpClientFactory,
        ILogger logger,
        string method,
        string requestUrl,
        Dictionary<string, string> headers,
        string? content,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        // IMPORTANT NOTE: the "CustomTool" client disables auto-redirects; a 3xx must not bypass the base-URL host guardrail.
        var httpClient = httpClientFactory.CreateClient("CustomTool");

        using var request = new HttpRequestMessage(new HttpMethod(method), requestUrl);
        foreach (var header in headers)
        {
            request.Headers.TryAddWithoutValidation(header.Key, header.Value);
        }

        if (content is not null)
        {
            request.Content = new StringContent(content, Encoding.UTF8, contentType);
        }

        using var timeoutCancellationTokenSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCancellationTokenSource.CancelAfter(RequestTimeout);

        try
        {
            using var response = await httpClient.SendAsync(
                request,
                HttpCompletionOption.ResponseHeadersRead,
                timeoutCancellationTokenSource.Token);

            await using var responseStream = await response.Content.ReadAsStreamAsync(timeoutCancellationTokenSource.Token);
            var buffer = new System.IO.MemoryStream();
            var readBuffer = new byte[8192];
            int read;
            while ((read = await responseStream.ReadAsync(readBuffer.AsMemory(), timeoutCancellationTokenSource.Token)) > 0)
            {
                if (buffer.Length + read > MaxResponseBytes)
                {
                    return (BadGatewayStatusCode, string.Empty, "The upstream API response exceeded the 5 MB limit.");
                }

                buffer.Write(readBuffer, 0, read);
            }

            var body = Encoding.UTF8.GetString(buffer.ToArray());
            return ((int)response.StatusCode, body, null);
        }
        catch (OperationCanceledException)
        {
            cancellationToken.ThrowIfCancellationRequested();
            if (timeoutCancellationTokenSource.IsCancellationRequested)
            {
                return (GatewayTimeoutStatusCode, string.Empty, "The upstream API request timed out after 30 seconds.");
            }

            throw;
        }
        catch (Exception ex) when (ex is HttpRequestException or System.IO.IOException)
        {
            var safeUrl = request.RequestUri?.GetLeftPart(UriPartial.Path);
            logger.LogWarning(ex, "The upstream API request failed for {Url}.", safeUrl);
            return (BadGatewayStatusCode, string.Empty, "The upstream API request failed.");
        }
    }
}
