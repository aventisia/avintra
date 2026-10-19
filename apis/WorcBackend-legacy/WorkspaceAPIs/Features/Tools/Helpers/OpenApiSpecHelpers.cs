namespace WorkspaceAPIs.Features.Tools.Helpers;

/// <summary>
/// Provides helper methods for transforming an OpenAPI specification into a simplified,
/// LLM-friendly JSON document that contains only the metadata needed to invoke operations.
/// </summary>
public static class OpenApiSpecHelpers
{
    /// <summary>
    /// Flattens a raw OpenAPI JSON spec into a compact schema with info, servers, and path-level operations.
    /// </summary>
    /// <param name="openApiSpec">The raw OpenAPI spec as a JSON string.</param>
    /// <returns>A flattened <see cref="JsonDocument"/> or <c>null</c> when parsing fails.</returns>
    public static JsonDocument? FlattenOpenApiSpec(string openApiSpec)
    {
        try
        {
            var openApiDocument = JsonDocument.Parse(openApiSpec);
            var rootElement = openApiDocument.RootElement;
            var flattenedPaths = new JsonObject();

            if (rootElement.TryGetProperty("paths", out var pathsElement))
            {
                foreach (var pathProperty in pathsElement.EnumerateObject())
                {
                    var operationsByMethod = new JsonObject();

                    foreach (var operationProperty in pathProperty.Value.EnumerateObject())
                    {
                        var operationSummary = new JsonObject
                        {
                            ["operationId"] = GetStringValue(operationProperty.Value, "operationId"),
                            ["summary"] = GetStringValue(operationProperty.Value, "summary"),
                            ["description"] = GetStringValue(operationProperty.Value, "description"),
                            ["method"] = JsonValue.Create(operationProperty.Name.ToUpperInvariant()),
                            ["path"] = JsonValue.Create(pathProperty.Name),
                            ["isVerified"] = false,
                        };

                        operationSummary["parameters"] = ExtractParameters(operationProperty.Value);
                        operationSummary["headers"] = ExtractHeaders(operationProperty.Value);
                        operationSummary["requestBody"] = ExtractRequestBody(operationProperty.Value);
                        operationSummary["responses"] = ExtractResponses(operationProperty.Value);
                        operationSummary["x-agent-node"] = ExtractAgentNode(operationProperty.Value);

                        operationsByMethod[operationProperty.Name] = operationSummary;
                    }

                    flattenedPaths[pathProperty.Name] = operationsByMethod;
                }
            }

            var flattenedSpec = new JsonObject
            {
                ["info"] = ExtractInfo(rootElement),
                ["servers"] = ExtractServers(rootElement),
                ["paths"] = flattenedPaths,
            };

            return JsonDocument.Parse(flattenedSpec.ToJsonString());
        }
        catch
        {
            return null;
        }
    }

    private static JsonNode? GetStringValue(JsonElement element, string propertyName)
    {
        if (element.TryGetProperty(propertyName, out var property))
        {
            return JsonValue.Create(property.GetString());
        }

        return JsonValue.Create("");
    }

    private static JsonNode ExtractInfo(JsonElement rootElement)
    {
        var result = new JsonObject();
        if (!rootElement.TryGetProperty("info", out var infoElement))
        {
            return result;
        }

        result["title"] = GetStringValue(infoElement, "title");
        result["version"] = GetStringValue(infoElement, "version");
        result["description"] = GetStringValue(infoElement, "description");

        return result;
    }

    private static JsonNode ExtractServers(JsonElement rootElement)
    {
        var result = new JsonArray();
        if (!rootElement.TryGetProperty("servers", out var serversElement))
        {
            return result;
        }

        foreach (var serverElement in serversElement.EnumerateArray())
        {
            var serverSummary = new JsonObject
            {
                ["url"] = GetStringValue(serverElement, "url"),
                ["description"] = GetStringValue(serverElement, "description"),
            };
            result.Add(serverSummary);
        }

        return result;
    }

    private static JsonNode ExtractParameters(JsonElement operationElement)
    {
        var result = new JsonArray();
        if (!operationElement.TryGetProperty("parameters", out var parametersElement))
        {
            return result;
        }

        foreach (var parameterElement in parametersElement.EnumerateArray())
        {
            var parameterSummary = new JsonObject
            {
                ["name"] = GetStringValue(parameterElement, "name"),
                ["in"] = GetStringValue(parameterElement, "in"),
                ["required"] = JsonValue.Create(parameterElement.TryGetProperty("required", out var requiredElement) && requiredElement.GetBoolean()),
                ["description"] = GetStringValue(parameterElement, "description"),
                ["type"] = GetParameterValue(parameterElement),
            };
            result.Add(parameterSummary);
        }

        return result;
    }

    private static JsonNode ExtractHeaders(JsonElement operationElement)
    {
        var result = new JsonArray();
        if (!operationElement.TryGetProperty("parameters", out var parametersElement))
        {
            return result;
        }

        foreach (var parameterElement in parametersElement.EnumerateArray())
        {
            if (!parameterElement.TryGetProperty("in", out var inElement) ||
                !string.Equals(inElement.GetString(), "header", StringComparison.OrdinalIgnoreCase) ||
                !parameterElement.TryGetProperty("name", out var nameElement))
            {
                continue;
            }

            result.Add(new JsonObject
            {
                ["key"] = JsonValue.Create(nameElement.GetString()),
                ["description"] = GetStringValue(parameterElement, "description"),
            });
        }

        return result;
    }

    private static JsonNode? GetParameterValue(JsonElement parameterElement)
    {
        if (parameterElement.TryGetProperty("type", out var typeElement) &&
            typeElement.ValueKind == JsonValueKind.String)
        {
            return JsonValue.Create(typeElement.GetString());
        }

        if (parameterElement.TryGetProperty("schema", out var schemaElement) &&
            schemaElement.ValueKind == JsonValueKind.Object &&
            schemaElement.TryGetProperty("type", out var schemaTypeElement) &&
            schemaTypeElement.ValueKind == JsonValueKind.String)
        {
            return JsonValue.Create(schemaTypeElement.GetString());
        }

        return null;
    }

    private static JsonNode? ExtractResponses(JsonElement operationElement)
    {
        if (!operationElement.TryGetProperty("responses", out var responsesElement) ||
            responsesElement.ValueKind != JsonValueKind.Object ||
            !responsesElement.EnumerateObject().Any())
        {
            return null;
        }

        JsonProperty? preferred = null;
        foreach (var responseProperty in responsesElement.EnumerateObject())
        {
            if (preferred is null ||
                (responseProperty.Name.StartsWith("2", StringComparison.Ordinal) &&
                 !(preferred.Value.Name.StartsWith("2", StringComparison.Ordinal))))
            {
                preferred = responseProperty;
            }
        }

        if (preferred is null)
        {
            return null;
        }

        var result = new JsonObject
        {
            ["statusCode"] = ParseStatusCode(preferred.Value.Name),
        };

        if (preferred.Value.Value.TryGetProperty("content", out var contentElement) &&
            contentElement.ValueKind == JsonValueKind.Object)
        {
            foreach (var contentTypeProperty in contentElement.EnumerateObject())
            {
                result["contentType"] = JsonValue.Create(contentTypeProperty.Name);
                if (contentTypeProperty.Value.TryGetProperty("schema", out var schemaElement))
                {
                    result["schema"] = ExtractSchemaSummary(schemaElement);
                }

                break;
            }
        }

        return result;
    }

    private static int? ParseStatusCode(string statusCodeName) =>
        int.TryParse(statusCodeName, out var statusCode) ? statusCode : null;

    private static JsonNode? ExtractAgentNode(JsonElement operationElement)
    {
        if (!operationElement.TryGetProperty("x-agent-node", out var agentNodeElement) ||
            agentNodeElement.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        var result = new JsonObject();
        if (agentNodeElement.TryGetProperty("icon", out var iconElement))
        {
            result["icon"] = GetStringValue(agentNodeElement, "icon");
        }

        if (agentNodeElement.TryGetProperty("color", out var colorElement))
        {
            result["color"] = GetStringValue(agentNodeElement, "color");
        }

        return result.Count == 0 ? null : result;
    }

    private static JsonNode ExtractRequestBody(JsonElement operationElement)
    {
        var result = new JsonObject();
        if (!operationElement.TryGetProperty("requestBody", out var requestBodyElement))
        {
            return result;
        }

        result["required"] = JsonValue.Create(
            requestBodyElement.TryGetProperty("required", out var requiredElement) && requiredElement.GetBoolean());

        if (!requestBodyElement.TryGetProperty("content", out var contentElement))
        {
            return result;
        }

        foreach (var contentTypeProperty in contentElement.EnumerateObject())
        {
            if (contentTypeProperty.Value.TryGetProperty("schema", out var schemaElement))
            {
                result["contentType"] = JsonValue.Create(contentTypeProperty.Name);
                result["schema"] = ExtractSchemaSummary(schemaElement);
            }
        }

        return result;
    }

    private static JsonNode ExtractSchemaSummary(JsonElement schemaElement)
    {
        var result = new JsonObject
        {
            ["type"] = GetStringValue(schemaElement, "type"),
        };

        if (schemaElement.TryGetProperty("items", out var itemsElement) &&
            itemsElement.ValueKind == JsonValueKind.Object)
        {
            schemaElement = itemsElement;
        }

        if (schemaElement.TryGetProperty("properties", out var propertiesElement))
        {
            var requiredNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            if (schemaElement.TryGetProperty("required", out var requiredArrayElement) &&
                requiredArrayElement.ValueKind == JsonValueKind.Array)
            {
                foreach (var requiredName in requiredArrayElement.EnumerateArray())
                {
                    if (requiredName.ValueKind == JsonValueKind.String)
                    {
                        requiredNames.Add(requiredName.GetString()!);
                    }
                }
            }

            var propertiesArray = new JsonArray();
            foreach (var property in propertiesElement.EnumerateObject())
            {
                propertiesArray.Add(new JsonObject
                {
                    ["name"] = JsonValue.Create(property.Name),
                    ["type"] = GetStringValue(property.Value, "type"),
                    ["description"] = GetStringValue(property.Value, "description"),
                    ["required"] = JsonValue.Create(requiredNames.Contains(property.Name)),
                });
            }

            result["properties"] = propertiesArray;
        }

        return result;
    }
}
