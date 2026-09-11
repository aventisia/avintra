using System.Text.Json.Serialization;

namespace WorkspaceAPIs.Features.Corsair;

/// <summary>
/// Deserialized shape of a generated Corsair config file
/// (<c>&lt;Plugin&gt;/&lt;Action&gt;Connector.json</c>). These files are deployed to the
/// shared server path derived from the configured upload directory
/// (<c>AppDefaultConfig:FileUploadConfig:UploadDirectory</c> →
/// <c>.../files/configs/Corsair</c>) and fall back to the codebase
/// <c>Features/CloudConnectors/ConfigFiles/Corsair/</c> folder locally.
///
/// These files follow the Studio DCP schema (name/description/fields) only.
/// The backend invocation metadata (dotted action, auth type, config keys) is
/// stored in a separate <c>CorsairActionMap.json</c> file so the Studio-facing
/// config contains no extra properties.
/// </summary>
public class CorsairConnectorConfig
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("version")]
    public string? Version { get; set; }

    [JsonPropertyName("author")]
    public string? Author { get; set; }

    [JsonPropertyName("supportedPlatforms")]
    public List<string>? SupportedPlatforms { get; set; }

    [JsonPropertyName("errorHandling")]
    public string? ErrorHandling { get; set; }

    [JsonPropertyName("testScreenType")]
    public string? TestScreenType { get; set; }

    [JsonPropertyName("fields")]
    public List<CorsairConnectorField> Fields { get; set; } = new();
}

/// <summary>A single property/credential/output field in a Corsair config.</summary>
public class CorsairConnectorField
{
    [JsonPropertyName("direction")]
    public string? Direction { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("label")]
    public string? Label { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("defaultValue")]
    public object? DefaultValue { get; set; }

    [JsonPropertyName("selectOptions")]
    public List<CorsairSelectOption>? SelectOptions { get; set; }
}

public class CorsairSelectOption
{
    [JsonPropertyName("label")]
    public string? Label { get; set; }

    [JsonPropertyName("value")]
    public string? Value { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }
}

/// <summary>
/// A single entry in the generated <c>CorsairActionMap.json</c>.
/// Maps a Studio node name to the exact sidecar invocation metadata.
/// </summary>
public class CorsairActionInvocation
{
    [JsonPropertyName("nodeName")]
    public string? NodeName { get; set; }

    [JsonPropertyName("plugin")]
    public string? Plugin { get; set; }

    [JsonPropertyName("action")]
    public string? Action { get; set; }

    [JsonPropertyName("authType")]
    public string? AuthType { get; set; }

    [JsonPropertyName("configKeys")]
    public List<string>? ConfigKeys { get; set; }
}
