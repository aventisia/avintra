using WorkspaceAPIs.DTOs;

namespace WorkspaceAPIs.Features.Tools.Helpers;

/// <summary>
/// Builds the dynamic-config-panel node config for a custom-tool action node
/// (<c>CustomTool/{toolName}.{operationId}</c>) from the tool's flattened OpenAPI
/// operation, mirroring the cloud-connector config-file contract consumed by the
/// studio DCP.
/// </summary>
public static class CustomToolNodeConfigHelpers
{
    private const string CredentialFieldName = "__CredentialName__CustomApiTool";

    /// <summary>
    /// Node-name prefix identifying a custom-tool action node. The studio builds
    /// node names with this prefix and the runtime executor routes on it, so the
    /// prefix is part of the persisted node identity.
    /// </summary>
    public const string NodeNamePrefix = "CustomTool/";

    /// <summary>
    /// Builds the node config payload for a custom-tool operation, or <c>null</c>
    /// when the operation cannot be resolved from the parsed schema.
    /// </summary>
    /// <param name="tool">The custom tool owning the operation.</param>
    /// <param name="operation">The flattened OpenAPI operation.</param>
    /// <returns>The node config as a JSON-ready object; <c>null</c> when there is nothing to render.</returns>
    public static object? BuildNodeConfig(Tool tool, UsableToolOperationDto operation)
    {
        if (string.IsNullOrWhiteSpace(operation.Method) || string.IsNullOrWhiteSpace(operation.Path))
        {
            return null;
        }

        var fields = new List<object> { BuildCredentialField(tool) };

        foreach (var parameter in operation.Parameters ?? [])
        {
            fields.Add(BuildParameterField(parameter));
        }

        foreach (var property in operation.RequestBody?.Properties ?? [])
        {
            fields.Add(BuildBodyPropertyField(property));
        }

        fields.Add(BuildOutputField(operation));

        var method = operation.Method.ToUpperInvariant();
        var label = operation.Summary?.Trim();
        var description = operation.Description?.Trim();
        if (string.IsNullOrWhiteSpace(description))
        {
            description = string.IsNullOrWhiteSpace(label)
                ? $"{method} {operation.Path}".Trim()
                : null;
        }

        return new
        {
            // The node name "CustomTool/{toolName}.{operationId}" is the DCP lookup key.
            name = $"{NodeNamePrefix}{tool.Name}.{operation.OperationId}",
            label = label ?? operation.OperationId,
            description = description ?? $"Custom tool action ({method} {operation.Path}).",
            version = "1.0.0",
            author = "Aventisia",
            supportedPlatforms = new[] { "cloud", "windows" },
            errorHandling = "standard",
            testScreenType = "standard",
            fields,
        };
    }

    /// <summary>
    /// Builds the credential selector field. Custom tools always authenticate via
    /// the CustomApiTool vault type.
    /// </summary>
    private static object BuildCredentialField(Tool tool)
    {
        var label = string.IsNullOrWhiteSpace(tool.CredentialName)
            ? "Credential"
            : $"{tool.Name} Credential";

        return new
        {
            direction = "Input",
            type = "credentials-select",
            name = CredentialFieldName,
            label,
            description = $"The {tool.Name} credential used to authenticate API requests.",
            defaultValue = string.Empty,
        };
    }

    /// <summary>
    /// Builds the input field for a path/query/header parameter.
    /// </summary>
    private static object BuildParameterField(UsableToolOperationParameterDto parameter)
    {
        var locationHint = string.IsNullOrWhiteSpace(parameter.In)
            ? string.Empty
            : $" ({parameter.In.ToLowerInvariant()})";

        return new
        {
            direction = "Input",
            type = MapFieldType(parameter.Type),
            name = parameter.Name,
            label = $"{parameter.Name}{locationHint}",
            description = parameter.Description,
            defaultValue = MapDefaultValue(parameter.Type),
            required = parameter.In == "path" || parameter.Required,
        };
    }

    /// <summary>
    /// Builds the input field for a request-body schema property.
    /// </summary>
    private static object BuildBodyPropertyField(UsableToolOperationPropertyDto property)
    {
        return new
        {
            direction = "Input",
            type = MapFieldType(property.Type),
            name = property.Name,
            label = property.Name,
            description = property.Description,
            defaultValue = MapDefaultValue(property.Type),
            required = property.Required,
        };
    }

    /// <summary>
    /// Builds the output field: one output per documented response property when
    /// the spec provides any, otherwise a single Result output carrying the
    /// whole upstream response.
    /// </summary>
    private static object BuildOutputField(UsableToolOperationDto operation)
    {
        var responseProperties = operation.Response?.Properties ?? [];
        if (responseProperties.Count > 0)
        {
            return new
            {
                direction = "Output",
                type = "config-panel-output",
                name = responseProperties[0].Name,
                label = responseProperties[0].Name,
                description = responseProperties[0].Description,
                defaultValue = new { value = responseProperties[0].Name, enabled = true },
            };
        }

        return new
        {
            direction = "Output",
            type = "config-panel-output",
            name = "Result",
            label = "Result",
            description = $"Returns the response data from the {operation.Method?.ToUpperInvariant()} {operation.Path} call.",
            defaultValue = new { value = "Result", enabled = true },
        };
    }

    /// <summary>
    /// Maps an OpenAPI schema type to the DCP control type. Unmapped types fall
    /// back to text.
    /// </summary>
    private static string MapFieldType(string? type) =>
        type?.ToLowerInvariant() switch
        {
            "integer" or "number" => "number",
            "boolean" => "switch",
            "object" => "textarea",
            _ => "text",
        };

    /// <summary>
    /// Builds the default value matching the mapped control type.
    /// </summary>
    private static object MapDefaultValue(string? type) =>
        type?.ToLowerInvariant() switch
        {
            "integer" or "number" => 0,
            "boolean" => false,
            _ => string.Empty,
        };
}