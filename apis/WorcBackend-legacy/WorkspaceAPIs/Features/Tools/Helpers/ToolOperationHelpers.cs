using System.Text.Json;
using System.Text.Json.Nodes;
using WorkspaceAPIs.DTOs;

namespace WorkspaceAPIs.Features.Tools.Helpers;

/// <summary>
/// Provides helper methods for extracting invocable operations from a tool's parsed OpenAPI schema.
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
    /// Supports both the flattened `paths` shape and a pre-flattened `operations` array.
    /// </summary>
    /// <param name="parsedSchema">The tool's parsed OpenAPI schema.</param>
    /// <param name="fallbackIsVerified">
    /// Tool-level verification used for operations that carry no explicit
    /// <c>isVerified</c> flag (legacy records and freshly flattened specs).
    /// </param>
    /// <returns>The list of operations; empty when the schema is missing or malformed.</returns>
    public static List<UsableToolOperationDto> ExtractOperations(
        JsonDocument? parsedSchema,
        bool fallbackIsVerified = false)
    {
        var operations = new List<UsableToolOperationDto>();
        if (parsedSchema is null)
        {
            return operations;
        }

        try
        {
            var root = parsedSchema.RootElement;

            // Already-flattened operations array.
            if (root.TryGetProperty("operations", out var operationsElement) &&
                operationsElement.ValueKind == JsonValueKind.Array)
            {
                foreach (var operationElement in operationsElement.EnumerateArray())
                {
                    var operation = ReadOperation(operationElement, method: null, path: null, fallbackIsVerified);
                    if (operation is not null)
                    {
                        operations.Add(operation);
                    }
                }

                return operations;
            }

            // OpenAPI paths -> path -> method -> details.
            if (!root.TryGetProperty("paths", out var pathsElement) ||
                pathsElement.ValueKind != JsonValueKind.Object)
            {
                return operations;
            }

            foreach (var pathProperty in pathsElement.EnumerateObject())
            {
                if (pathProperty.Value.ValueKind != JsonValueKind.Object)
                {
                    continue;
                }

                foreach (var methodProperty in pathProperty.Value.EnumerateObject())
                {
                    if (!HttpMethods.Contains(methodProperty.Name))
                    {
                        continue;
                    }

                    var operation = ReadOperation(
                        methodProperty.Value,
                        methodProperty.Name.ToUpperInvariant(),
                        pathProperty.Name,
                        fallbackIsVerified);

                    if (operation is not null)
                    {
                        operations.Add(operation);
                    }
                }
            }
        }
        catch (System.Text.Json.JsonException)
        {
            // Ignore malformed schemas and return what was collected.
        }

        return operations;
    }

    /// <summary>
    /// Extracts the Corsair plugin id from a tool's parsed OpenAPI schema, when present.
    /// Corsair specs expose paths shaped as <c>/corsair/{pluginId}/{action}</c>.
    /// </summary>
    /// <param name="parsedSchema">The tool's parsed OpenAPI schema.</param>
    /// <returns>The plugin id; <c>null</c> when the schema is not a Corsair spec.</returns>
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

            // Fall back to the operationId prefix ("{pluginId}.{action}").
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
            // Ignore malformed schemas.
        }

        return null;
    }

    /// <summary>
    /// Parses the plugin id segment from a <c>/corsair/{pluginId}/{action}</c> path.
    /// </summary>
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

    /// <summary>
    /// Reads a single operation from its JSON element, falling back to the method/path for the identifier.
    /// </summary>
    private static UsableToolOperationDto? ReadOperation(
        JsonElement element,
        string? method,
        string? path,
        bool fallbackIsVerified = false)
    {
        if (element.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        var operationId = GetString(element, "operationId");
        var resolvedMethod = GetString(element, "method") ?? method;
        var resolvedPath = GetString(element, "path") ?? path;

        // Fall back to a derived identifier when the spec omits operationId.
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
            IsVerified = GetBool(element, "isVerified") ?? fallbackIsVerified,
        };
    }

    /// <summary>
    /// Returns a copy of the parsed schema with the given operation's
    /// <c>isVerified</c> flag set, supporting both the flattened <c>paths</c>
    /// shape and the pre-flattened <c>operations</c> array.
    /// </summary>
    /// <param name="parsedSchema">The tool's parsed OpenAPI schema.</param>
    /// <param name="operationId">The operation identifier to update.</param>
    /// <param name="isVerified">The verification flag to persist.</param>
    /// <returns>
    /// A new document with the flag applied, or the original document when the
    /// operation cannot be located or the schema is malformed.
    /// </returns>
    public static JsonDocument? SetOperationVerification(
        JsonDocument? parsedSchema,
        string operationId,
        bool isVerified)
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

            var updated = false;

            if (root["operations"] is JsonArray operationsArray)
            {
                foreach (var operationNode in operationsArray)
                {
                    if (operationNode is JsonObject operationObject &&
                        MatchesOperationId(operationObject, operationId, method: null, path: null))
                    {
                        operationObject["isVerified"] = isVerified;
                        updated = true;
                    }
                }
            }
            else if (root["paths"] is JsonObject paths)
            {
                foreach (var pathProperty in paths)
                {
                    if (pathProperty.Value is not JsonObject methods)
                    {
                        continue;
                    }

                    foreach (var methodProperty in methods)
                    {
                        if (methodProperty.Value is JsonObject operationObject &&
                            MatchesOperationId(
                                operationObject,
                                operationId,
                                methodProperty.Key.ToUpperInvariant(),
                                pathProperty.Key))
                        {
                            operationObject["isVerified"] = isVerified;
                            updated = true;
                        }
                    }
                }
            }

            return updated ? JsonDocument.Parse(root.ToJsonString()) : parsedSchema;
        }
        catch (System.Text.Json.JsonException)
        {
            // Ignore malformed schemas and keep the original document.
            return parsedSchema;
        }
    }

    /// <summary>
    /// Indicates whether every operation in the schema is verified. Returns false
    /// when the schema exposes no operations.
    /// </summary>
    /// <param name="parsedSchema">The tool's parsed OpenAPI schema.</param>
    /// <param name="fallbackIsVerified">Legacy tool-level fallback for operations without an explicit flag.</param>
    public static bool AreAllOperationsVerified(JsonDocument? parsedSchema, bool fallbackIsVerified = false)
    {
        var operations = ExtractOperations(parsedSchema, fallbackIsVerified);
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
    /// Carries the verified operation ids from <paramref name="source"/> onto
    /// <paramref name="target"/>. Used when a tool's OpenAPI spec is re-flattened
    /// so per-operation verification survives a create/update.
    /// </summary>
    /// <param name="source">The incoming schema that carries explicit verification flags.</param>
    /// <param name="target">The freshly flattened schema to apply the flags to.</param>
    /// <returns>The target schema with verified operations marked.</returns>
    public static JsonDocument? CopyOperationVerification(JsonDocument? source, JsonDocument? target)
    {
        if (source is null || target is null)
        {
            return target;
        }

        var verifiedOperationIds = ExtractOperations(source)
            .Where(operation => operation.IsVerified && !string.IsNullOrWhiteSpace(operation.OperationId))
            .Select(operation => operation.OperationId);

        var result = target;
        foreach (var operationId in verifiedOperationIds)
        {
            result = SetOperationVerification(result, operationId, isVerified: true);
        }

        return result;
    }

    /// <summary>
    /// Compares an operation JSON object's identifier to the target id, deriving
    /// the same method/path fallback used by <see cref="ExtractOperations"/> when
    /// the object carries no explicit <c>operationId</c>.
    /// </summary>
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

    /// <summary>
    /// Reads a non-empty string from a JSON node.
    /// </summary>
    private static string? GetNodeString(JsonNode? node) =>
        node is JsonValue value && value.TryGetValue<string>(out var text) && !string.IsNullOrWhiteSpace(text)
            ? text
            : null;

    /// <summary>
    /// Reads a boolean property from a JSON object, or <c>null</c> when absent/not boolean.
    /// </summary>
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

    /// <summary>
    /// Reads the flattened parameter summaries of an operation.
    /// </summary>
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

    /// <summary>
    /// Reads the flattened request body summary of an operation.
    /// </summary>
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

    /// <summary>
    /// Reads the flattened preferred response summary of an operation.
    /// </summary>
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

    /// <summary>
    /// Reads the flattened properties array of a request body or response summary.
    /// </summary>
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

    /// <summary>
    /// Reads a branding value from the flattened x-agent-node extension.
    /// </summary>
    private static string? ReadAgentNodeValue(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty("x-agent-node", out var agentNodeElement) ||
            agentNodeElement.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        return GetString(agentNodeElement, propertyName);
    }

    /// <summary>
    /// Reads a non-empty string property from a JSON object.
    /// </summary>
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
