using System.Text.Json.Serialization;

namespace WorkspaceAPIs.Features.CloudConnectors.CamelV2.Models;

/// <summary>
/// Deserialized shape of a single connector schema returned by the Camel harness
/// <c>GET /api/connectors/schemas</c> (or <c>GET /api/connectors/{connector}/schema</c>).
///
/// The harness emits a JSON Schema (draft 2020-12) per connector family. This DTO
/// mirrors the <c>ConnectorSchema</c> record produced by
/// <c>camel.harness.core.ConnectorSchemaGenerator</c>.
/// </summary>
public class CamelV2ConnectorSchema
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
    public Dictionary<string, CamelV2SchemaProperty>? Properties { get; set; }

    [JsonPropertyName("$defs")]
    public Dictionary<string, CamelV2SchemaDefinition>? Defs { get; set; }
}

/// <summary>
/// A single property within a connector schema. Mirrors
/// <c>camel.harness.core.ConnectorSchemaProperty</c>.
/// </summary>
public class CamelV2SchemaProperty
{
    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("required")]
    public List<string>? Required { get; set; }

    [JsonPropertyName("properties")]
    public Dictionary<string, CamelV2SchemaProperty>? NestedProperties { get; set; }

    [JsonPropertyName("defaultValue")]
    public string? DefaultValue { get; set; }

    [JsonPropertyName("enumValues")]
    public List<string>? EnumValues { get; set; }

    [JsonPropertyName("defaultBoolean")]
    public bool? DefaultBoolean { get; set; }

    [JsonPropertyName("items")]
    public CamelV2SchemaProperty? Items { get; set; }
}

/// <summary>
/// A reusable definition within a connector schema. Mirrors
/// <c>camel.harness.core.ConnectorSchemaDefinition</c>.
/// </summary>
public class CamelV2SchemaDefinition
{
    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("properties")]
    public Dictionary<string, CamelV2SchemaProperty>? Properties { get; set; }
}

/// <summary>
/// Convenience accessors over a <see cref="CamelV2ConnectorSchema"/> that expose
/// the harness's well-known top-level sections (connector, operation,
/// configuration, auth, headers, payload, targetUri, uri, body, db).
/// </summary>
public static class CamelV2SchemaExtensions
{
    /// <summary>Gets the <c>connector</c> property (family name + schemes).</summary>
    public static CamelV2SchemaProperty? Connector(this CamelV2ConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("connector");

    /// <summary>Gets the <c>operation</c> property (enum of supported operations).</summary>
    public static CamelV2SchemaProperty? Operation(this CamelV2ConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("operation");

    /// <summary>Gets the <c>method</c> property (HTTP method, per-operation schemas).</summary>
    public static CamelV2SchemaProperty? Method(this CamelV2ConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("method");

    /// <summary>Gets the <c>path</c> property (path template, per-operation schemas).</summary>
    public static CamelV2SchemaProperty? Path(this CamelV2ConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("path");

    /// <summary>Gets the <c>parameters</c> property (per-operation schemas).</summary>
    public static CamelV2SchemaProperty? Parameters(this CamelV2ConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("parameters");

    /// <summary>Gets the <c>query</c> property (per-operation schemas).</summary>
    public static CamelV2SchemaProperty? Query(this CamelV2ConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("query");

    /// <summary>Gets the <c>inputFields</c> property (m365 per-operation schemas).</summary>
    public static CamelV2SchemaProperty? InputFields(this CamelV2ConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("inputFields");

    /// <summary>Gets the <c>configuration</c> property (required/optional config keys).</summary>
    public static CamelV2SchemaProperty? Configuration(this CamelV2ConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("configuration");

    /// <summary>Gets the <c>auth</c> property (required/optional auth keys).</summary>
    public static CamelV2SchemaProperty? Auth(this CamelV2ConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("auth");

    /// <summary>Gets the <c>headers</c> property.</summary>
    public static CamelV2SchemaProperty? Headers(this CamelV2ConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("headers");

    /// <summary>Gets the <c>payload</c> property.</summary>
    public static CamelV2SchemaProperty? Payload(this CamelV2ConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("payload");

    /// <summary>Gets the <c>targetUri</c> property (legacy full Camel URI).</summary>
    public static CamelV2SchemaProperty? TargetUri(this CamelV2ConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("targetUri");

    /// <summary>Gets the <c>uri</c> property (legacy alias).</summary>
    public static CamelV2SchemaProperty? Uri(this CamelV2ConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("uri");

    /// <summary>Gets the <c>body</c> property (legacy alias).</summary>
    public static CamelV2SchemaProperty? Body(this CamelV2ConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("body");

    /// <summary>Gets the <c>db</c> property (legacy database credentials).</summary>
    public static CamelV2SchemaProperty? Db(this CamelV2ConnectorSchema schema)
        => schema.Properties?.GetValueOrDefault("db");

    /// <summary>
    /// Returns the list of supported operations for the connector, or an empty
    /// list when the schema has no operation enum (e.g. catalog components with
    /// no hand-written configurer).
    /// </summary>
    public static IReadOnlyList<string> Operations(this CamelV2ConnectorSchema schema)
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
    public static string? ConnectorName(this CamelV2ConnectorSchema schema)
        => schema.Connector()?.DefaultValue;
}
