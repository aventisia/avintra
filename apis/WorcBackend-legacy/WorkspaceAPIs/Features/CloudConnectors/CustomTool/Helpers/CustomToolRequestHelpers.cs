namespace WorkspaceAPIs.Features.CloudConnectors.CustomTool.Helpers;

/// <summary>
/// Builds the outbound HTTP request for a custom-tool operation and parses the response.
/// </summary>
public static class CustomToolRequestHelpers
{
    private static readonly HashSet<string> ForbiddenHeaderNames = new(StringComparer.OrdinalIgnoreCase)
    {
        "Host",
        "Content-Length",
        "Connection",
        "Transfer-Encoding",
        "Upgrade",
        "Keep-Alive",
        "TE",
        "Trailer",
        "Expect",
        "Proxy-Connection",
        "Proxy-Authenticate",
        "Proxy-Authorization",
    };

    /// <summary>
    /// Builds the request URL from the base URL, path placeholders, query parameters and credential key.
    /// </summary>
    public static (string? RequestUrl, Dictionary<string, object> RemainingPayload, string? Error) BuildRequestUrl(
        Uri baseUri,
        UsableToolOperationDto operation,
        CustomToolPayloadSections sections,
        string? credentialQuery)
    {
        var values = sections.BuildParameterValues();

        var resolvedPath = operation.Path!.TrimStart('/');
        var missingPlaceholders = new List<string>();
        foreach (var placeholder in ExtractPathPlaceholders(operation.Path))
        {
            if (values.TryGetValue(placeholder, out var value))
            {
                resolvedPath = resolvedPath.Replace(
                    $"{{{placeholder}}}",
                    Uri.EscapeDataString(value?.ToString() ?? string.Empty));
            }
            else
            {
                missingPlaceholders.Add(placeholder);
            }
        }

        if (missingPlaceholders.Count > 0)
        {
            return (null, new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase),
                $"Missing required path parameter(s): {string.Join(", ", missingPlaceholders)}.");
        }

        var query = System.Web.HttpUtility.ParseQueryString(string.Empty);
        foreach (var parameter in operation.Parameters ?? [])
        {
            if (string.Equals(parameter.In, "path", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(parameter.In, "header", StringComparison.OrdinalIgnoreCase) ||
                string.IsNullOrWhiteSpace(parameter.Name) ||
                !values.TryGetValue(parameter.Name, out var queryValue))
            {
                continue;
            }

            query[parameter.Name] = queryValue?.ToString() ?? string.Empty;
        }

        if (!string.IsNullOrEmpty(credentialQuery))
        {
            var separatorIndex = credentialQuery!.IndexOf('=');
            var name = credentialQuery[..separatorIndex];
            var value = credentialQuery[(separatorIndex + 1)..];
            query[name] = value;
        }

        var pathAndQuery = resolvedPath;
        var queryString = query.ToString();
        if (!string.IsNullOrEmpty(queryString))
        {
            pathAndQuery = $"{pathAndQuery}?{queryString}";
        }

        var remainingPayload = new Dictionary<string, object>(sections.Extras, StringComparer.OrdinalIgnoreCase);

        // IMPORTANT NOTE: UriPartial.Authority drops the base URL's path prefix (e.g. "/v1") and causes upstream 404s.
        var baseUrlPrefix = baseUri.GetLeftPart(UriPartial.Path).TrimEnd('/');
        return ($"{baseUrlPrefix}/{pathAndQuery}", remainingPayload, null);
    }

    /// <summary>
    /// Applies the operation's header parameters and credential headers, with credentials winning.
    /// </summary>
    public static void BuildRequestHeaders(
        UsableToolOperationDto operation,
        CustomToolPayloadSections sections,
        Dictionary<string, string> target,
        Dictionary<string, string> credentialHeaders)
    {
        foreach (var header in sections.Headers)
        {
            if (string.IsNullOrWhiteSpace(header.Key) ||
                header.Value is null ||
                IsForbiddenHeader(header.Key))
            {
                continue;
            }

            target[header.Key] = header.Value.ToString() ?? string.Empty;
        }

        var values = sections.BuildParameterValues();
        foreach (var parameter in operation.Parameters ?? [])
        {
            if (!string.Equals(parameter.In, "header", StringComparison.OrdinalIgnoreCase) ||
                string.IsNullOrWhiteSpace(parameter.Name) ||
                IsForbiddenHeader(parameter.Name) ||
                !values.TryGetValue(parameter.Name, out var headerValue))
            {
                continue;
            }

            target[parameter.Name] = headerValue?.ToString() ?? string.Empty;
        }

        foreach (var header in credentialHeaders)
        {
            target[header.Key] = header.Value;
        }
    }

    /// <summary>
    /// Builds the JSON request body for body-capable methods, or nothing for the others.
    /// </summary>
    public static (string? Content, string ContentType) BuildRequestContent(
        UsableToolOperationDto operation,
        CustomToolPayloadSections sections,
        Dictionary<string, object> remainingPayload)
    {
        var method = operation.Method!.ToUpperInvariant();
        var supportsBody = method is "POST" or "PUT" or "PATCH";
        if (!supportsBody)
        {
            return (null, "application/json");
        }

        if (sections.IsRawRequestPayload)
        {
            return (sections.RequestPayload, operation.RequestBody?.ContentType ?? "application/json");
        }

        var bodyProperties = operation.RequestBody?.Properties?
            .Where(p => !string.IsNullOrWhiteSpace(p.Name))
            .Select(p => p.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase) ?? [];

        var bodyObject = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);

        foreach (var kvp in sections.RequestBodyProperties)
        {
            bodyObject[kvp.Key] = kvp.Value;
        }

        foreach (var kvp in remainingPayload)
        {
            if (bodyProperties.Count == 0 || bodyProperties.Contains(kvp.Key))
            {
                bodyObject[kvp.Key] = kvp.Value;
            }
        }

        if (bodyObject.Count == 0)
        {
            return (null, "application/json");
        }

        return (System.Text.Json.JsonSerializer.Serialize(bodyObject), operation.RequestBody?.ContentType ?? "application/json");
    }

    /// <summary>
    /// Parses the upstream body as JSON when possible, otherwise returns the raw text.
    /// </summary>
    public static object? ParseResponseBody(string responseText)
    {
        if (string.IsNullOrWhiteSpace(responseText))
        {
            return null;
        }

        try
        {
            return System.Text.Json.JsonSerializer.Deserialize<object>(responseText);
        }
        catch (System.Text.Json.JsonException)
        {
            return responseText;
        }
    }

    private static bool IsForbiddenHeader(string headerName) =>
        ForbiddenHeaderNames.Contains(headerName);

    private static List<string> ExtractPathPlaceholders(string path)
    {
        var placeholders = new List<string>();
        foreach (System.Text.RegularExpressions.Match match in
            System.Text.RegularExpressions.Regex.Matches(path, "\\{([^/{}]+)\\}"))
        {
            placeholders.Add(match.Groups[1].Value);
        }

        return placeholders;
    }
}
