using System.Text.Json.Serialization;

namespace WorkspaceAPIs.Features.CloudConnectors.Camel.Models;

/// <summary>
/// Deserialized shape of a single connector schema returned by the Camel harness
/// <c>GET /api/connectors/schemas</c> (or <c>GET /api/connectors/{connector}/schema</c>).
///
/// The harness emits a JSON Schema (draft 2020-12) per connector family. This DTO
/// mirrors the <c>ConnectorSchema</c> record produced by
/// <c>camel.harness.core.ConnectorSchemaGenerator</c>.
/// </summary>
public class CamelConnectorSchema
{
    [JsonPropertyName("$schema")]
    public string? Schema { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("required")]
    public List<string>? Required { get; set; }

    [JsonPropertyName("properties")]
    public Dictionary<string, CamelConnectorSchemaProperty>? Properties { get; set; }

    [JsonPropertyName("$defs")]
    public Dictionary<string, CamelConnectorSchemaDefinition>? Defs { get; set; }
}

/// <summary>
/// A single property within a connector schema. Mirrors
/// <c>camel.harness.core.ConnectorSchemaProperty</c>.
/// </summary>
public class CamelConnectorSchemaProperty
{
    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("required")]
    public List<string>? Required { get; set; }

    [JsonPropertyName("properties")]
    public Dictionary<string, CamelConnectorSchemaProperty>? NestedProperties { get; set; }

    [JsonPropertyName("defaultValue")]
    public string? DefaultValue { get; set; }

    [JsonPropertyName("enumValues")]
    public List<string>? EnumValues { get; set; }

    [JsonPropertyName("defaultBoolean")]
    public bool? DefaultBoolean { get; set; }

    [JsonPropertyName("items")]
    public CamelConnectorSchemaProperty? Items { get; set; }
}

/// <summary>
/// A single entry from <c>GET /api/connectors/</c> — the authoritative Apache
/// Camel component summary with the real component description (the schemas
/// endpoint only returns the generic connector request description).
/// </summary>
public class CamelConnectorListItem
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }
}

/// <summary>
/// A reusable definition within a connector schema. Mirrors
/// <c>camel.harness.core.ConnectorSchemaDefinition</c>.
/// </summary>
public class CamelConnectorSchemaDefinition
{
    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("properties")]
    public Dictionary<string, CamelConnectorSchemaProperty>? Properties { get; set; }
}

/// <summary>
/// Convenience accessors over a <see cref="CamelConnectorSchema"/> that expose
/// the harness's well-known top-level sections (connector, operation,
/// configuration, auth, headers, payload, targetUri, uri, body, db).
/// </summary>
public static class CamelSchemaExtensions
{
    /// <summary>Gets the <c>connector</c> property (family name + schemes).</summary>
    public static CamelConnectorSchemaProperty? Connector(this CamelConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("connector");

    /// <summary>Gets the <c>operation</c> property (enum of supported operations).</summary>
    public static CamelConnectorSchemaProperty? Operation(this CamelConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("operation");

    /// <summary>Gets the <c>method</c> property (HTTP method, per-operation schemas).</summary>
    public static CamelConnectorSchemaProperty? Method(this CamelConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("method");

    /// <summary>Gets the <c>path</c> property (path template, per-operation schemas).</summary>
    public static CamelConnectorSchemaProperty? Path(this CamelConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("path");

    /// <summary>Gets the <c>parameters</c> property (per-operation schemas).</summary>
    public static CamelConnectorSchemaProperty? Parameters(this CamelConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("parameters");

    /// <summary>Gets the <c>query</c> property (per-operation schemas).</summary>
    public static CamelConnectorSchemaProperty? Query(this CamelConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("query");

    /// <summary>Gets the <c>inputFields</c> property (legacy per-operation schemas).</summary>
    public static CamelConnectorSchemaProperty? InputFields(this CamelConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("inputFields");

    /// <summary>Gets the <c>configuration</c> property (required/optional config keys).</summary>
    public static CamelConnectorSchemaProperty? Configuration(this CamelConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("configuration");

    /// <summary>Gets the <c>auth</c> property (required/optional auth keys).</summary>
    public static CamelConnectorSchemaProperty? Auth(this CamelConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("auth");

    /// <summary>Gets the <c>headers</c> property.</summary>
    public static CamelConnectorSchemaProperty? Headers(this CamelConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("headers");

    /// <summary>Gets the <c>payload</c> property.</summary>
    public static CamelConnectorSchemaProperty? Payload(this CamelConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("payload");

    /// <summary>Gets the <c>targetUri</c> property (legacy full Camel URI).</summary>
    public static CamelConnectorSchemaProperty? TargetUri(this CamelConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("targetUri");

    /// <summary>Gets the <c>uri</c> property (legacy alias).</summary>
    public static CamelConnectorSchemaProperty? Uri(this CamelConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("uri");

    /// <summary>Gets the <c>body</c> property (legacy alias).</summary>
    public static CamelConnectorSchemaProperty? Body(this CamelConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("body");

    /// <summary>Gets the <c>db</c> property (legacy database credentials).</summary>
    public static CamelConnectorSchemaProperty? Db(this CamelConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("db");

    /// <summary>
    /// Returns the list of supported operations for the connector, or an empty
    /// list when the schema has no operation enum (e.g. catalog components with
    /// no hand-written configurer).
    /// </summary>
    public static IReadOnlyList<string> Operations(this CamelConnectorSchema schema)
    {
        var op = schema.Operation();
        if (op?.EnumValues is { Count: > 0 })
        {
            return op.EnumValues;
        }
        return Array.Empty<string>();
    }

    /// <summary>
    /// Returns the connector family name from the <c>connector</c> property's
    /// default value, or null when absent.
    /// </summary>
    public static string? ConnectorName(this CamelConnectorSchema schema)
        => schema.Connector()?.DefaultValue;

    /// <summary>
    /// Classifies the authentication shape declared by the schema's <c>auth</c>
    /// section so callers can map it to their own auth type vocabulary.
    ///
    /// The harness's <c>auth.required</c> list is the authoritative signal: when
    /// it is empty the connector does not require authentication (the generic
    /// auth schema always lists every possible property, so property presence
    /// alone must not be used to infer a required auth type).
    /// </summary>
    public static CamelAuthKind AuthKind(this CamelConnectorSchema? schema)
    {
        var auth = schema?.Auth();
        if (auth?.NestedProperties is not { Count: > 0 } props)
        {
            return CamelAuthKind.None;
        }

        var required = auth.Required ?? new List<string>();
        if (required.Count == 0)
        {
            return CamelAuthKind.None;
        }

        // Database auth is declared by the harness as required url/username
        // (with optional password) — e.g. sql, jdbc, sql-stored.
        if (required.Contains("url") || props.ContainsKey("url"))
        {
            return CamelAuthKind.Database;
        }
        if (required.Contains("token") || required.Contains("accessToken") || required.Contains("bearer"))
        {
            return CamelAuthKind.Token;
        }
        if (required.Contains("apiKey"))
        {
            return CamelAuthKind.ApiKey;
        }
        if (required.Contains("username") || required.Contains("password"))
        {
            return CamelAuthKind.Basic;
        }
        if (required.Contains("clientId") || required.Contains("clientSecret"))
        {
            return CamelAuthKind.ClientCredentials;
        }

        return CamelAuthKind.None;
    }
}

/// <summary>Classification of the authentication shape in a Camel schema.</summary>
public enum CamelAuthKind
{
    None,
    Token,
    ApiKey,
    Basic,
    ClientCredentials,
    Database,
}
