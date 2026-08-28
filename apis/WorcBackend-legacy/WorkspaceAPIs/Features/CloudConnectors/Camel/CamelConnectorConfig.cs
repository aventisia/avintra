using System.Text.Json.Serialization;

namespace WorkspaceAPIs.Features.CloudConnectors.Camel;

/// <summary>
/// Deserialized shape of a generated Camel connector config file
/// (<c>ConfigFiles/Camel/&lt;Family&gt;/&lt;Action&gt;Connector.json</c>).
///
/// These files are the single source of truth for the node schema AND the
/// field-level Camel mapping. Each field carries its own <c>camel</c> block
/// describing where its value goes in the harness request:
///   - <c>connector</c>   family name (route segment, e.g. "github")
///   - <c>operation</c>   dotted harness operation (e.g. "branch.list")
///   - <c>authType</c>    none / basic / database / accessToken / client_credentials
///   - <c>credentials</c>  whether a credential is required and its field name
///   - <c>fields[].camel</c> per-field mapping: location (path/query/header/body/
///     property/parameter) + the Camel-side name
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

    [JsonPropertyName("connector")]
    public CamelConnectorMeta? Connector { get; set; }

    [JsonPropertyName("credentials")]
    public CamelCredentialsMeta? Credentials { get; set; }

    [JsonPropertyName("fields")]
    public List<CamelConnectorField> Fields { get; set; } = new();

    // Legacy metadata block kept for backward compatibility with existing
    // config files that have not yet been regenerated.
    [JsonPropertyName("camel")]
    public CamelMeta? Camel { get; set; }
}

/// <summary>Connector identity and authentication type.</summary>
public class CamelConnectorMeta
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("operation")]
    public string? Operation { get; set; }

    [JsonPropertyName("authType")]
    public string? AuthType { get; set; }
}

/// <summary>Credential requirement for the connector operation.</summary>
public class CamelCredentialsMeta
{
    [JsonPropertyName("required")]
    public bool Required { get; set; }

    [JsonPropertyName("fieldName")]
    public string? FieldName { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; }
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

    [JsonPropertyName("required")]
    public bool Required { get; set; }

    [JsonPropertyName("defaultValue")]
    public object? DefaultValue { get; set; }

    [JsonPropertyName("selectOptions")]
    public List<CamelSelectOption>? SelectOptions { get; set; }

    /// <summary>Field-level Camel mapping (location + Camel-side name).</summary>
    [JsonPropertyName("camel")]
    public CamelFieldMapping? Camel { get; set; }
}

/// <summary>Where and under what name a field value is sent to the harness.</summary>
public class CamelFieldMapping
{
    /// <summary>
    /// Destination in the harness request: path, query, header, body, property,
    /// or parameter.
    /// </summary>
    [JsonPropertyName("location")]
    public string? Location { get; set; }

    /// <summary>The name used on the Camel side (e.g. the path placeholder or
    /// query parameter name).</summary>
    [JsonPropertyName("name")]
    public string? Name { get; set; }
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

/// <summary>
/// Legacy structured metadata used to convert node fields into the harness
/// envelope. Kept for backward compatibility; new configs use per-field
/// <see cref="CamelFieldMapping"/> instead.
/// </summary>
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

    [JsonPropertyName("requestFields")]
    public List<CamelRequestField>? RequestFields { get; set; }
}

/// <summary>Classification of a single request field in the flat contract.</summary>
public class CamelRequestField
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("location")]
    public string? Location { get; set; }

    [JsonPropertyName("required")]
    public bool Required { get; set; }
}
