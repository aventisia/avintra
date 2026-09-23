using System.Text.Json;
using System.Text.Json.Nodes;
using WorkspaceAPIs.DTOs;

namespace WorkspaceAPIs.Features.Tools.Helpers;

/// <summary>
/// Provides helper methods for synthesizing a standard OpenAPI specification from
/// manually authored tool operations, so manual tools flow through the same
/// flatten/test/execute pipeline as spec-based tools.
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

    // Generates an operationId from the operation name, sanitized for OpenAPI keys.
    public static string GenerateOperationId(string name)
    {
        var builder = new System.Text.StringBuilder(name.Length);
        foreach (var character in name.Trim())
        {
            builder.Append(char.IsWhiteSpace(character) ? '_' : character);
        }

        return builder.Length == 0 ? "operation" : builder.ToString();
    }

    /// <summary>
    /// Synthesizes a raw OpenAPI 3.0 JSON specification from the tool's base URL
    /// and manually authored operations.
    /// </summary>
    /// <param name="manualOperations">The manually authored operations.</param>
    /// <returns>The OpenAPI spec as a JSON string; <c>null</c> when no operations are provided.</returns>
    public static string? Synthesize(IReadOnlyCollection<ManualToolOperationDto> manualOperations)
    {
        if (manualOperations.Count == 0)
        {
            return null;
        }

        var paths = new JsonObject();

        foreach (var operation in manualOperations)
        {
            var method = operation.Method?.Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(operation.Endpoint) ||
                string.IsNullOrWhiteSpace(method) ||
                !SupportedMethods.Contains(method))
            {
                continue;
            }

            var endpoint = operation.Endpoint.Trim();
            if (!endpoint.StartsWith('/'))
            {
                endpoint = $"/{endpoint}";
            }

            var pathItem = paths[endpoint] as JsonObject ?? [];
            if (pathItem.ContainsKey(method))
            {
                // Keep the first definition when the same endpoint+method repeats.
                continue;
            }

            var pathParameters = ExtractPathParameters(endpoint);
            var operationId = GenerateOperationId(operation.Name);
            var operationObject = BuildOperationObject(operation, method, endpoint, operationId, pathParameters);

            pathItem[method] = operationObject;
            paths[endpoint] = pathItem;
        }

        if (paths.Count == 0)
        {
            return null;
        }

        var spec = new JsonObject
        {
            ["openapi"] = "3.0.3",
            ["info"] = new JsonObject
            {
                ["title"] = "Manual Custom Tool",
                ["version"] = "1.0.0",
            },
            ["paths"] = paths,
        };

        return spec.ToJsonString();
    }

    /// <summary>
    /// Builds the OpenAPI operation object for a manually authored operation,
    /// including parameters from path placeholders, user parameters, static
    /// headers, and a request body inferred from the JSON payload sample.
    /// </summary>
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

        // Path placeholders become required string parameters.
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

        // User-defined parameters follow path parameters.
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
                ["required"] = parameter.Required,
                ["description"] = parameter.Description ?? string.Empty,
                ["schema"] = new JsonObject
                {
                    ["type"] = string.IsNullOrWhiteSpace(parameter.Type) ? "string" : parameter.Type,
                },
            });
        }

        // Static headers become optional header parameters.
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
                ["description"] = $"Static header for {operation.Name}.",
                ["schema"] = new JsonObject { ["type"] = "string", ["default"] = header.Value ?? string.Empty },
            });
        }

        if (parameters.Count > 0)
        {
            operationObject["parameters"] = parameters;
        }

        // Infer the request body schema from the JSON payload sample.
        var requestBody = BuildRequestBody(operation.JsonPayload, SupportsRequestBody(method));
        if (requestBody is not null)
        {
            operationObject["requestBody"] = requestBody;
        }

        // Declare a 2xx response so the flattener persists response metadata.
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

    /// <summary>
    /// Determines whether the HTTP method semantically supports a request body.
    /// </summary>
    private static bool SupportsRequestBody(string method) =>
        method is "post" or "put" or "patch";

    /// <summary>
    /// Builds the OpenAPI request body object from a JSON payload sample.
    /// </summary>
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
            // Ignore malformed payloads; the operation is created without a body.
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

    /// <summary>
    /// Infers a JSON schema node from a JSON payload sample, recursing through
    /// objects and arrays.
    /// </summary>
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

        // Strings and any unrecognized nodes map to string.
        return new JsonObject { ["type"] = "string" };
    }

    /// <summary>
    /// Extracts unique path placeholder names from an endpoint template.
    /// </summary>
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