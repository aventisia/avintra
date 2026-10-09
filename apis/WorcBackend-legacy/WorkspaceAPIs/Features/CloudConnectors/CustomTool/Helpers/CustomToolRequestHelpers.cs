namespace WorkspaceAPIs.Features.CloudConnectors.CustomTool.Helpers;

/// <summary>
/// Builds the outbound HTTP request for a custom-tool operation and parses the response.
/// </summary>
public static class CustomToolRequestHelpers
{
    /// <summary>
    /// Builds the request URL: substitutes path placeholders, appends query
    /// parameters from the payload, and appends the credential's API-key query
    /// when applicable.
    /// </summary>
    public static (string RequestUrl, Dictionary<string, object> RemainingPayload) BuildRequestUrl(
        Uri baseUri,
        UsableToolOperationDto operation,
        CustomToolPayloadSections sections,
        string? credentialQuery)
    {
        var values = sections.BuildParameterValues();

        var resolvedPath = operation.Path!.TrimStart('/');
        foreach (var placeholder in ExtractPathPlaceholders(operation.Path))
        {
            if (values.TryGetValue(placeholder, out var value))
            {
                resolvedPath = resolvedPath.Replace(
                    $"{{{placeholder}}}",
                    Uri.EscapeDataString(value?.ToString() ?? string.Empty));
            }
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
        return ($"{baseUrlPrefix}/{pathAndQuery}", remainingPayload);
    }

    /// <summary>
    /// Applies the request headers: the Headers JSON editor first, then the
    /// operation's header parameters resolved from the Parameters section, and
    /// finally the credential headers (which win, since authentication must not
    /// be overridden by user input).
    /// </summary>
    public static void BuildRequestHeaders(
        UsableToolOperationDto operation,
        CustomToolPayloadSections sections,
        Dictionary<string, string> target,
        Dictionary<string, string> credentialHeaders)
    {
        foreach (var header in sections.Headers)
        {
            if (string.IsNullOrWhiteSpace(header.Key) || header.Value is null)
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
    /// Builds the request body for methods that support one. Body properties are
    /// collected from the Request Payload JSON editor; when the operation declares
    /// no body schema, the payload is sent as-is so free-form specs still work.
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
    /// Parses the upstream body into JSON when possible so the flow engine receives
    /// a queryable object; otherwise the raw text is returned.
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
