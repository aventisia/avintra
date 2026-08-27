using System.Text.Json.Serialization;

namespace WorkspaceAPIs.Features.CloudConnectors.Camel;

/// <summary>
/// Deserialized shape of a generated Camel connector config file
/// (<c>ConfigFiles/Camel/&lt;Family&gt;/&lt;Action&gt;Connector.json</c>).
///
/// These files follow the existing Cloud Connector schema (name/description/
/// fields) plus a structured <c>camel</c> metadata block that describes how to
/// convert the node's field values into the harness <c>ConnectorRequest</c>
/// envelope:
///   - <c>connector</c>   family name (route segment, e.g. "file")
///   - <c>operation</c>   fixed dotted harness operation (github/m365) or null
///                        when the wrapper reads it from the payload's operation select
///   - <c>authType</c>    none / basic / database / accessToken / client_credentials
///   - <c>bodyField</c>   node field name that carries the request payload
///   - <c>configKeys</c>  node field names placed into the harness `configuration`
/// </summary>
public class CamelConnectorConfig
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
    public List<CamelConnectorField> Fields { get; set; } = new();

    [JsonPropertyName("camel")]
    public CamelMeta? Camel { get; set; }
}

/// <summary>A single property/credential/output field in a Camel connector config.</summary>
public class CamelConnectorField
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
    public List<CamelSelectOption>? SelectOptions { get; set; }
}

public class CamelSelectOption
{
    [JsonPropertyName("label")]
    public string? Label { get; set; }

    [JsonPropertyName("value")]
    public string? Value { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }
}

/// <summary>Structured metadata used to convert node fields into the harness envelope.</summary>
public class CamelMeta
{
    [JsonPropertyName("connector")]
    public string? Connector { get; set; }

    [JsonPropertyName("operation")]
    public string? Operation { get; set; }

    [JsonPropertyName("authType")]
    public string? AuthType { get; set; }

    [JsonPropertyName("bodyField")]
    public string? BodyField { get; set; }

    [JsonPropertyName("configKeys")]
    public List<string>? ConfigKeys { get; set; }
}
