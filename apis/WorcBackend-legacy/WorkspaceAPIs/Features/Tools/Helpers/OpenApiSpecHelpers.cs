using System.Text.Json;
using System.Text.Json.Nodes;

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
            // Step 1: Parse the incoming OpenAPI JSON document.
            var openApiDocument = JsonDocument.Parse(openApiSpec);
            var rootElement = openApiDocument.RootElement;
            var flattenedPaths = new JsonObject();

            // Step 2: Transform each path and its operations into a simplified structure.
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
                        };

                        operationSummary["parameters"] = ExtractParameters(operationProperty.Value);
                        operationSummary["requestBody"] = ExtractRequestBody(operationProperty.Value);

                        operationsByMethod[operationProperty.Name] = operationSummary;
                    }

                    flattenedPaths[pathProperty.Name] = operationsByMethod;
                }
            }

            // Step 3: Assemble the final flattened document.
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

    /// <summary>
    /// Extracts a string value from a JSON element, returning an empty string when missing.
    /// </summary>
    private static JsonNode? GetStringValue(JsonElement element, string propertyName)
    {
        if (element.TryGetProperty(propertyName, out var property))
        {
            return JsonValue.Create(property.GetString());
        }

        return JsonValue.Create("");
    }

    /// <summary>
    /// Extracts the OpenAPI info object (title, version, description).
    /// </summary>
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

    /// <summary>
    /// Extracts the OpenAPI servers array.
    /// </summary>
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

    /// <summary>
    /// Extracts operation parameters into a simplified array.
    /// </summary>
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
            };
            result.Add(parameterSummary);
        }

        return result;
    }

    /// <summary>
    /// Extracts the request body metadata, including required flag, content type, and schema summary.
    /// </summary>
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

    /// <summary>
    /// Extracts a schema summary, including type and a simplified property list when available.
    /// </summary>
    private static JsonNode ExtractSchemaSummary(JsonElement schemaElement)
    {
        var result = new JsonObject
        {
            ["type"] = GetStringValue(schemaElement, "type"),
        };

        if (schemaElement.TryGetProperty("properties", out var propertiesElement))
        {
            var propertiesObject = new JsonObject();
            foreach (var property in propertiesElement.EnumerateObject())
            {
                propertiesObject[property.Name] = new JsonObject
                {
                    ["type"] = GetStringValue(property.Value, "type"),
                    ["description"] = GetStringValue(property.Value, "description"),
                };
            }
            result["properties"] = propertiesObject;
        }

        return result;
    }
}
