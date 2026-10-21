namespace WorkspaceAPIs.Features.Tools.Helpers;

/// <summary>
/// Outcome of synthesizing an OpenAPI specification: the spec, or the validation error that rejected the operations.
/// </summary>
public readonly record struct ManualOpenApiSynthesisResult(string? Spec, string? Error);

/// <summary>
/// Synthesizes an OpenAPI specification from manually authored tool operations.
/// </summary>
public static class ManualOpenApiSynthesizer
{
    private static readonly HashSet<string> SupportedMethods = new(StringComparer.OrdinalIgnoreCase)
    {
        "get",
        "post",
        "put",
        "patch",
        "delete",
    };

    private static readonly HashSet<string> SupportedParameterLocations = new(StringComparer.OrdinalIgnoreCase)
    {
        "query",
        "header",
    };

    /// <summary>
    /// Generates a deterministic operation ID from the tool and operation names.
    /// </summary>
    public static string GenerateOperationId(string? toolName, string operationName)
    {
        var toolPart = SanitizeOperationIdPart(toolName);
        var operationPart = SanitizeOperationIdPart(operationName);

        var combined = string.Join(
            '_',
            new[] { toolPart, operationPart }.Where(part => part.Length > 0));

        return combined.Length == 0 ? "operation" : combined;
    }

    private static string SanitizeOperationIdPart(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var builder = new System.Text.StringBuilder(value.Length);
        foreach (var character in value.Trim().ToUpperInvariant())
        {
            var isAlphanumeric = (character >= 'A' && character <= 'Z') ||
                                 (character >= '0' && character <= '9');
            if (isAlphanumeric)
            {
                builder.Append(character);
            }
            else if (builder.Length > 0 && builder[^1] != '_')
            {
                builder.Append('_');
            }
        }

        return builder.Length > 0 && builder[^1] == '_'
            ? builder.ToString(0, builder.Length - 1)
            : builder.ToString();
    }

    /// <summary>
    /// Indicates whether a stored specification was synthesized from manual operations.
    /// </summary>
    public static bool IsSynthesizedSpec(string? spec)
    {
        if (string.IsNullOrWhiteSpace(spec))
        {
            return false;
        }

        try
        {
            return JsonNode.Parse(spec) is JsonObject root &&
                   root["info"] is JsonObject info &&
                   info["x-manual-tool"]?.GetValueKind() == System.Text.Json.JsonValueKind.True;
        }
        catch (System.Text.Json.JsonException)
        {
            return false;
        }
    }

    /// <summary>
    /// Synthesizes a raw OpenAPI 3.0 JSON specification from the tool's manually authored operations.
    /// </summary>
    public static ManualOpenApiSynthesisResult Synthesize(
        IReadOnlyCollection<ManualToolOperationDto> manualOperations,
        string? toolName = null)
    {
        if (manualOperations.Count == 0)
        {
            return new ManualOpenApiSynthesisResult(null, null);
        }

        var paths = new JsonObject();

        foreach (var operation in manualOperations)
        {
            var method = operation.Method?.Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(operation.Endpoint) || string.IsNullOrWhiteSpace(method))
            {
                continue;
            }

            if (!SupportedMethods.Contains(method))
            {
                return new ManualOpenApiSynthesisResult(
                    null,
                    $"Operation '{operation.Name}' uses the unsupported HTTP method '{operation.Method!.Trim()}'. Supported methods: GET, POST, PUT, PATCH, DELETE.");
            }

            var endpoint = operation.Endpoint.Trim();
            if (!endpoint.StartsWith('/'))
            {
                endpoint = $"/{endpoint}";
            }

            var pathItem = paths[endpoint] as JsonObject ?? [];
            if (pathItem.ContainsKey(method))
            {
                return new ManualOpenApiSynthesisResult(
                    null,
                    $"Operation '{operation.Name}' duplicates another operation's {method.ToUpperInvariant()} {endpoint}. Each method and endpoint pair must be unique.");
            }

            var pathParameters = ExtractPathParameters(endpoint);
            var operationId = GenerateOperationId(toolName, operation.Name);
            var operationObject = BuildOperationObject(operation, method, endpoint, operationId, pathParameters);

            pathItem[method] = operationObject;
            paths[endpoint] = pathItem;
        }

        if (paths.Count == 0)
        {
            return new ManualOpenApiSynthesisResult(null, null);
        }

        var spec = new JsonObject
        {
            ["openapi"] = "3.0.3",
            ["info"] = new JsonObject
            {
                ["title"] = string.IsNullOrWhiteSpace(toolName) ? "Manual Custom Tool" : toolName.Trim(),
                ["version"] = "1.0.0",
                ["x-manual-tool"] = true,
            },
            ["paths"] = paths,
        };

        return new ManualOpenApiSynthesisResult(spec.ToJsonString(), null);
    }

    private static JsonObject BuildOperationObject(
        ManualToolOperationDto operation,
        string method,
        string endpoint,
        string operationId,
        IReadOnlyCollection<string> pathParameters)
    {
        var operationObject = new JsonObject
        {
            ["operationId"] = operationId,
            ["summary"] = operation.Name,
            ["description"] = operation.Description ?? string.Empty,
        };

        var parameters = new JsonArray();

        foreach (var pathParameter in pathParameters)
        {
            parameters.Add(new JsonObject
            {
                ["name"] = pathParameter,
                ["in"] = "path",
                ["required"] = true,
                ["description"] = $"Path parameter {pathParameter}.",
                ["schema"] = new JsonObject { ["type"] = "string" },
            });
        }

        foreach (var parameter in operation.Parameters ?? [])
        {
            var parameterIn = parameter.In?.Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(parameter.Name) ||
                string.IsNullOrWhiteSpace(parameterIn) ||
                !SupportedParameterLocations.Contains(parameterIn) ||
                pathParameters.Contains(parameter.Name, StringComparer.Ordinal))
            {
                continue;
            }

            parameters.Add(new JsonObject
            {
                ["name"] = parameter.Name,
                ["in"] = parameterIn,
                ["required"] = false,
                ["description"] = parameter.Description ?? string.Empty,
                ["schema"] = new JsonObject
                {
                    ["type"] = "string",
                },
            });
        }

        foreach (var header in operation.Headers ?? [])
        {
            if (string.IsNullOrWhiteSpace(header.Key) ||
                pathParameters.Contains(header.Key, StringComparer.Ordinal))
            {
                continue;
            }

            parameters.Add(new JsonObject
            {
                ["name"] = header.Key,
                ["in"] = "header",
                ["required"] = false,
                ["description"] = header.Description ?? string.Empty,
                ["schema"] = new JsonObject { ["type"] = "string" },
            });
        }

        if (parameters.Count > 0)
        {
            operationObject["parameters"] = parameters;
        }

        var requestBody = BuildRequestBody(operation.JsonPayload, SupportsRequestBody(method));
        if (requestBody is not null)
        {
            operationObject["requestBody"] = requestBody;
        }

        operationObject["responses"] = new JsonObject
        {
            ["200"] = new JsonObject
            {
                ["description"] = "Successful response.",
                ["content"] = new JsonObject
                {
                    ["application/json"] = new JsonObject
                    {
                        ["schema"] = new JsonObject { ["type"] = "object" },
                    },
                },
            },
        };

        return operationObject;
    }

    private static bool SupportsRequestBody(string method) =>
        method is "post" or "put" or "patch" or "delete";

    private static JsonObject? BuildRequestBody(string? jsonPayload, bool supportsRequestBody)
    {
        if (!supportsRequestBody || string.IsNullOrWhiteSpace(jsonPayload))
        {
            return null;
        }

        JsonNode? payloadSample;
        try
        {
            payloadSample = JsonNode.Parse(jsonPayload);
        }
        catch (System.Text.Json.JsonException)
        {
            return null;
        }

        if (payloadSample is null)
        {
            return null;
        }

        return new JsonObject
        {
            ["required"] = false,
            ["content"] = new JsonObject
            {
                ["application/json"] = new JsonObject
                {
                    ["schema"] = InferSchema(payloadSample),
                },
            },
        };
    }

    private static JsonObject InferSchema(JsonNode? node)
    {
        if (node is JsonObject jsonObject)
        {
            var schema = new JsonObject
            {
                ["type"] = "object",
            };

            var properties = new JsonObject();
            foreach (var property in jsonObject)
            {
                properties[property.Key] = InferSchema(property.Value);
            }

            schema["properties"] = properties;
            return schema;
        }

        if (node is JsonArray jsonArray)
        {
            var schema = new JsonObject
            {
                ["type"] = "array",
            };

            JsonNode? firstItem = jsonArray.Count > 0 ? jsonArray[0] : null;
            if (firstItem is not null)
            {
                schema["items"] = InferSchema(firstItem);
            }

            return schema;
        }

        if (node is JsonValue jsonValue)
        {
            if (jsonValue.TryGetValue<bool>(out _))
            {
                return new JsonObject { ["type"] = "boolean" };
            }

            if (jsonValue.TryGetValue<long>(out _))
            {
                return new JsonObject { ["type"] = "integer" };
            }

            if (jsonValue.TryGetValue<double>(out _))
            {
                return new JsonObject { ["type"] = "number" };
            }
        }

        return new JsonObject { ["type"] = "string" };
    }

    private static List<string> ExtractPathParameters(string endpoint)
    {
        var parameters = new List<string>();
        var searchIndex = 0;

        while (searchIndex < endpoint.Length)
        {
            var openIndex = endpoint.IndexOf('{', searchIndex);
            if (openIndex < 0)
            {
                break;
            }

            var closeIndex = endpoint.IndexOf('}', openIndex + 1);
            if (closeIndex < 0)
            {
                break;
            }

            var parameterName = endpoint[(openIndex + 1)..closeIndex].Trim();
            if (parameterName.Length > 0 &&
                !parameters.Contains(parameterName, StringComparer.Ordinal))
            {
                parameters.Add(parameterName);
            }

            searchIndex = closeIndex + 1;
        }

        return parameters;
    }
}
