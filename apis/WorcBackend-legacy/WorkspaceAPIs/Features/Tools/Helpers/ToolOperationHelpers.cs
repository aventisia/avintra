using System.Text.Json;
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
    /// <returns>The list of operations; empty when the schema is missing or malformed.</returns>
    public static List<UsableToolOperationDto> ExtractOperations(JsonDocument? parsedSchema)
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
                    var operation = ReadOperation(operationElement, method: null, path: null);
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
                        pathProperty.Name);

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
    private static UsableToolOperationDto? ReadOperation(JsonElement element, string? method, string? path)
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
        };
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
