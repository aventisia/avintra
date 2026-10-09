using System.Text;

namespace WorkspaceAPIs.Features.CloudConnectors.CustomTool.Helpers;

/// <summary>
/// Sends a custom-tool HTTP request under the 30-second timeout and 5 MB response cap.
/// </summary>
public static class CustomToolTransportHelpers
{
    private static readonly TimeSpan RequestTimeout = TimeSpan.FromSeconds(30);
    private const long MaxResponseBytes = 5 * 1024 * 1024;

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
        string contentType)
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

        using var timeoutCancellationTokenSource = new CancellationTokenSource(RequestTimeout);

        HttpResponseMessage response;
        try
        {
            response = await httpClient.SendAsync(
                request,
                HttpCompletionOption.ResponseHeadersRead,
                timeoutCancellationTokenSource.Token);
        }
        catch (OperationCanceledException) when (timeoutCancellationTokenSource.IsCancellationRequested)
        {
            return (0, string.Empty, "The upstream API request timed out after 30 seconds.");
        }
        catch (HttpRequestException ex)
        {
            logger.LogWarning(ex, "The upstream API request failed for {Url}.", requestUrl);
            return (0, string.Empty, $"The upstream API request failed: {ex.Message}");
        }

        using (response)
        {
            await using var responseStream = await response.Content.ReadAsStreamAsync(timeoutCancellationTokenSource.Token);
            var buffer = new System.IO.MemoryStream();
            var readBuffer = new byte[8192];
            int read;
            while ((read = await responseStream.ReadAsync(readBuffer, 0, readBuffer.Length, timeoutCancellationTokenSource.Token)) > 0)
            {
                if (buffer.Length + read > MaxResponseBytes)
                {
                    return (0, string.Empty, "The upstream API response exceeded the 5 MB limit.");
                }

                buffer.Write(readBuffer, 0, read);
            }

            var body = Encoding.UTF8.GetString(buffer.ToArray());
            return ((int)response.StatusCode, body, null);
        }
    }
}
