namespace WorkspaceAPIs.Features.Tools.Helpers;

/// <summary>
/// Extracts invocable operations from a tool's parsed OpenAPI schema and manages their verification flags.
/// </summary>
public static class ToolOperationHelpers
{
    private static readonly HashSet<string> HttpMethods = new(StringComparer.OrdinalIgnoreCase)
    {
        "get",
        "post",
        "put",
        "patch",
        "delete",
        "head",
        "options",
        "trace",
    };

    /// <summary>
    /// Extracts the flat list of operations from a tool's parsed OpenAPI schema.
    /// </summary>
    /// <remarks>
    /// <paramref name="persistedIsVerified"/> only backfills legacy schemas in which no operation carries an
    /// <c>isVerified</c> flag.
    /// </remarks>
    public static List<UsableToolOperationDto> ExtractOperations(
        JsonDocument? parsedSchema,
        bool persistedIsVerified = false)
    {
        if (parsedSchema is null)
        {
            return new List<UsableToolOperationDto>();
        }

        try
        {
            var operationElements = EnumerateOperationElements(parsedSchema.RootElement).ToList();
            var backfillIsVerified = persistedIsVerified &&
                                     !operationElements.Any(entry => entry.Element.TryGetProperty("isVerified", out _));

            return operationElements
                .Select(entry => ReadOperation(entry.Element, entry.Method, entry.Path, backfillIsVerified))
                .OfType<UsableToolOperationDto>()
                .ToList();
        }
        catch (System.Text.Json.JsonException)
        {
            return new List<UsableToolOperationDto>();
        }
    }

    private static IEnumerable<(JsonElement Element, string? Method, string? Path)> EnumerateOperationElements(
        JsonElement root)
    {
        if (root.TryGetProperty("operations", out var operationsElement) &&
            operationsElement.ValueKind == JsonValueKind.Array)
        {
            foreach (var operationElement in operationsElement.EnumerateArray())
            {
                yield return (operationElement, null, null);
            }

            yield break;
        }

        if (!root.TryGetProperty("paths", out var pathsElement) ||
            pathsElement.ValueKind != JsonValueKind.Object)
        {
            yield break;
        }

        foreach (var pathProperty in pathsElement.EnumerateObject())
        {
            if (pathProperty.Value.ValueKind != JsonValueKind.Object)
            {
                continue;
            }

            foreach (var methodProperty in pathProperty.Value.EnumerateObject())
            {
                if (HttpMethods.Contains(methodProperty.Name))
                {
                    yield return (methodProperty.Value, methodProperty.Name.ToUpperInvariant(), pathProperty.Name);
                }
            }
        }
    }

    /// <summary>
    /// Extracts the Corsair plugin id from a tool's parsed OpenAPI schema, when present.
    /// </summary>
    public static string? TryGetCorsairPluginId(JsonDocument? parsedSchema)
    {
        if (parsedSchema is null)
        {
            return null;
        }

        try
        {
            var root = parsedSchema.RootElement;

            if (root.TryGetProperty("paths", out var pathsElement) &&
                pathsElement.ValueKind == JsonValueKind.Object)
            {
                foreach (var pathProperty in pathsElement.EnumerateObject())
                {
                    var pluginId = ParseCorsairPath(pathProperty.Name);
                    if (!string.IsNullOrWhiteSpace(pluginId))
                    {
                        return pluginId;
                    }
                }
            }

            if (root.TryGetProperty("operations", out var operationsElement) &&
                operationsElement.ValueKind == JsonValueKind.Array)
            {
                foreach (var operationElement in operationsElement.EnumerateArray())
                {
                    var operationId = GetString(operationElement, "operationId");
                    if (!string.IsNullOrWhiteSpace(operationId))
                    {
                        var separatorIndex = operationId.IndexOf('.');
                        if (separatorIndex > 0)
                        {
                            return operationId[..separatorIndex];
                        }
                    }
                }
            }
        }
        catch (System.Text.Json.JsonException)
        {
        }

        return null;
    }

    private static string? ParseCorsairPath(string path)
    {
        const string prefix = "/corsair/";
        if (string.IsNullOrWhiteSpace(path) ||
            !path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        var remainder = path[prefix.Length..];
        var separatorIndex = remainder.IndexOf('/');
        var pluginId = separatorIndex > 0 ? remainder[..separatorIndex] : remainder;
        return string.IsNullOrWhiteSpace(pluginId) ? null : pluginId;
    }

    private static UsableToolOperationDto? ReadOperation(
        JsonElement element,
        string? method,
        string? path,
        bool persistedIsVerified = false)
    {
        if (element.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        var operationId = GetString(element, "operationId");
        var resolvedMethod = GetString(element, "method") ?? method;
        var resolvedPath = GetString(element, "path") ?? path;

        if (string.IsNullOrWhiteSpace(operationId))
        {
            if (string.IsNullOrWhiteSpace(resolvedMethod) || string.IsNullOrWhiteSpace(resolvedPath))
            {
                return null;
            }

            operationId = $"{resolvedMethod}_{resolvedPath}";
        }

        return new UsableToolOperationDto
        {
            OperationId = operationId,
            Method = resolvedMethod,
            Path = resolvedPath,
            Summary = GetString(element, "summary"),
            Description = GetString(element, "description"),
            Parameters = ReadParameters(element),
            RequestBody = ReadRequestBody(element),
            Response = ReadResponse(element),
            Icon = ReadAgentNodeValue(element, "icon"),
            Color = ReadAgentNodeValue(element, "color"),
            IsVerified = GetBool(element, "isVerified") ?? persistedIsVerified,
        };
    }

    /// <summary>
    /// Returns a copy of the parsed schema with the given operation's <c>isVerified</c> flag set.
    /// </summary>
    /// <remarks>
    /// On a legacy schema without per-operation flags, every other operation is first stamped with
    /// <paramref name="persistedIsVerified"/>, so it keeps the verification it previously inherited from the tool.
    /// </remarks>
    public static JsonDocument? SetOperationVerification(
        JsonDocument? parsedSchema,
        string operationId,
        bool isVerified,
        bool persistedIsVerified = false)
    {
        if (parsedSchema is null || string.IsNullOrWhiteSpace(operationId))
        {
            return parsedSchema;
        }

        try
        {
            if (JsonNode.Parse(parsedSchema.RootElement.GetRawText()) is not JsonObject root)
            {
                return parsedSchema;
            }

            var operationNodes = EnumerateOperationNodes(root).ToList();
            var targets = operationNodes
                .Where(entry => MatchesOperationId(entry.Operation, operationId, entry.Method, entry.Path))
                .ToList();

            if (targets.Count == 0)
            {
                return parsedSchema;
            }

            if (!operationNodes.Any(entry => entry.Operation.ContainsKey("isVerified")))
            {
                foreach (var entry in operationNodes)
                {
                    entry.Operation["isVerified"] = persistedIsVerified;
                }
            }

            foreach (var entry in targets)
            {
                entry.Operation["isVerified"] = isVerified;
            }

            return JsonDocument.Parse(root.ToJsonString());
        }
        catch (System.Text.Json.JsonException)
        {
            return parsedSchema;
        }
    }

    private static IEnumerable<(JsonObject Operation, string? Method, string? Path)> EnumerateOperationNodes(
        JsonObject root)
    {
        if (root["operations"] is JsonArray operationsArray)
        {
            foreach (var operationNode in operationsArray)
            {
                if (operationNode is JsonObject operationObject)
                {
                    yield return (operationObject, null, null);
                }
            }

            yield break;
        }

        if (root["paths"] is not JsonObject paths)
        {
            yield break;
        }

        foreach (var pathProperty in paths)
        {
            if (pathProperty.Value is not JsonObject methods)
            {
                continue;
            }

            foreach (var methodProperty in methods)
            {
                if (HttpMethods.Contains(methodProperty.Key) && methodProperty.Value is JsonObject operationObject)
                {
                    yield return (operationObject, methodProperty.Key.ToUpperInvariant(), pathProperty.Key);
                }
            }
        }
    }

    /// <summary>
    /// Indicates whether every operation in the schema is verified; false when the schema exposes no operations.
    /// </summary>
    /// <remarks>
    /// <paramref name="persistedIsVerified"/> is the tool's stored verification flag and must never come from a
    /// request payload: it only backfills operations of legacy schemas that predate the per-operation flag.
    /// </remarks>
    public static bool AreAllOperationsVerified(JsonDocument? parsedSchema, bool persistedIsVerified = false)
    {
        var operations = ExtractOperations(parsedSchema, persistedIsVerified);
        return operations.Count > 0 && operations.All(operation => operation.IsVerified);
    }

    /// <summary>
    /// Indicates whether all parsed operations have unique identifiers.
    /// </summary>
    public static bool HasUniqueOperationNames(JsonDocument? parsedSchema)
    {
        var names = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        return ExtractOperations(parsedSchema)
            .All(operation => !string.IsNullOrWhiteSpace(operation.OperationId) &&
                              names.Add(operation.OperationId.Trim()));
    }

    /// <summary>
    /// Copies verification from a tool's stored schema onto a freshly flattened schema, for operations whose
    /// id, method, path and parameter set are unchanged.
    /// </summary>
    public static JsonDocument? CopyOperationVerification(
        JsonDocument? persistedSchema,
        JsonDocument? flattenedSchema,
        bool persistedIsVerified = false)
    {
        if (persistedSchema is null || flattenedSchema is null)
        {
            return flattenedSchema;
        }

        var verifiedSignatures = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var operation in ExtractOperations(persistedSchema, persistedIsVerified)
                     .Where(operation => operation.IsVerified && !string.IsNullOrWhiteSpace(operation.OperationId)))
        {
            verifiedSignatures.TryAdd(operation.OperationId, GetOperationSignature(operation));
        }

        var unchangedOperationIds = ExtractOperations(flattenedSchema)
            .Where(operation => verifiedSignatures.TryGetValue(operation.OperationId, out var signature) &&
                                signature == GetOperationSignature(operation))
            .Select(operation => operation.OperationId);

        var result = flattenedSchema;
        foreach (var operationId in unchangedOperationIds)
        {
            result = SetOperationVerification(result, operationId, isVerified: true);
        }

        return result;
    }

    private static string GetOperationSignature(UsableToolOperationDto operation)
    {
        var parameters = (operation.Parameters ?? new List<UsableToolOperationParameterDto>())
            .Select(parameter => $"{parameter.In?.ToLowerInvariant()}:{parameter.Name}")
            .Order(StringComparer.Ordinal);

        return string.Join(
            "|",
            new[] { operation.Method?.ToUpperInvariant(), operation.Path }.Concat(parameters));
    }

    private static bool MatchesOperationId(
        JsonObject operationObject,
        string operationId,
        string? method,
        string? path)
    {
        var candidate = GetNodeString(operationObject["operationId"]);
        if (string.IsNullOrWhiteSpace(candidate))
        {
            var resolvedMethod = GetNodeString(operationObject["method"]) ?? method;
            var resolvedPath = GetNodeString(operationObject["path"]) ?? path;
            candidate = string.IsNullOrWhiteSpace(resolvedMethod) || string.IsNullOrWhiteSpace(resolvedPath)
                ? null
                : $"{resolvedMethod}_{resolvedPath}";
        }

        return string.Equals(candidate, operationId, StringComparison.OrdinalIgnoreCase);
    }

    private static string? GetNodeString(JsonNode? node) =>
        node is JsonValue value && value.TryGetValue<string>(out var text) && !string.IsNullOrWhiteSpace(text)
            ? text
            : null;

    private static bool? GetBool(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out var property))
        {
            return null;
        }

        return property.ValueKind switch
        {
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            _ => null,
        };
    }

    private static List<UsableToolOperationParameterDto>? ReadParameters(JsonElement element)
    {
        if (!element.TryGetProperty("parameters", out var parametersElement) ||
            parametersElement.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        var parameters = new List<UsableToolOperationParameterDto>();
        foreach (var parameterElement in parametersElement.EnumerateArray())
        {
            var name = GetString(parameterElement, "name");
            if (string.IsNullOrWhiteSpace(name))
            {
                continue;
            }

            parameters.Add(new UsableToolOperationParameterDto
            {
                Name = name,
                In = GetString(parameterElement, "in"),
                Required = parameterElement.TryGetProperty("required", out var requiredElement) &&
                    requiredElement.ValueKind == JsonValueKind.True,
                Description = GetString(parameterElement, "description"),
                Type = GetString(parameterElement, "type"),
            });
        }

        return parameters;
    }

    private static UsableToolOperationRequestBodyDto? ReadRequestBody(JsonElement element)
    {
        if (!element.TryGetProperty("requestBody", out var requestBodyElement) ||
            requestBodyElement.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        var requestBody = new UsableToolOperationRequestBodyDto
        {
            Required = requestBodyElement.TryGetProperty("required", out var requiredElement) &&
                requiredElement.ValueKind == JsonValueKind.True,
            ContentType = GetString(requestBodyElement, "contentType"),
            Properties = ReadProperties(requestBodyElement),
        };

        return requestBody;
    }

    private static UsableToolOperationResponseDto? ReadResponse(JsonElement element)
    {
        if (!element.TryGetProperty("responses", out var responsesElement) ||
            responsesElement.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        var response = new UsableToolOperationResponseDto
        {
            StatusCode = responsesElement.TryGetProperty("statusCode", out var statusCodeElement) &&
                statusCodeElement.ValueKind == JsonValueKind.Number
                    ? statusCodeElement.GetInt32()
                    : null,
            ContentType = GetString(responsesElement, "contentType"),
            Properties = ReadProperties(responsesElement),
        };

        return response;
    }

    private static List<UsableToolOperationPropertyDto>? ReadProperties(JsonElement element)
    {
        if (!element.TryGetProperty("schema", out var schemaElement) ||
            schemaElement.ValueKind != JsonValueKind.Object ||
            !schemaElement.TryGetProperty("properties", out var propertiesElement) ||
            propertiesElement.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        var properties = new List<UsableToolOperationPropertyDto>();
        foreach (var propertyElement in propertiesElement.EnumerateArray())
        {
            var name = GetString(propertyElement, "name");
            if (string.IsNullOrWhiteSpace(name))
            {
                continue;
            }

            properties.Add(new UsableToolOperationPropertyDto
            {
                Name = name,
                Type = GetString(propertyElement, "type"),
                Description = GetString(propertyElement, "description"),
                Required = propertyElement.TryGetProperty("required", out var requiredElement) &&
                    requiredElement.ValueKind == JsonValueKind.True,
            });
        }

        return properties;
    }

    private static string? ReadAgentNodeValue(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty("x-agent-node", out var agentNodeElement) ||
            agentNodeElement.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        return GetString(agentNodeElement, propertyName);
    }

    private static string? GetString(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out var property) ||
            property.ValueKind != JsonValueKind.String)
        {
            return null;
        }

        var value = property.GetString();
        return string.IsNullOrWhiteSpace(value) ? null : value;
    }
}

