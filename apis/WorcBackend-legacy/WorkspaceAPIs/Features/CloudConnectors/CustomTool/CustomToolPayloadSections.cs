using JsonException = System.Text.Json.JsonException;
using JsonSerializer = System.Text.Json.JsonSerializer;
using JsonValueKind = System.Text.Json.JsonValueKind;

namespace WorkspaceAPIs.Features.CloudConnectors.CustomTool;

/// <summary>
/// The three configuration sections the custom-tool dynamic-config-panel exposes
/// (credential selection is handled separately by the vault):
/// <list type="bullet">
/// <item><see cref="Headers"/> — additional HTTP request headers, as a JSON object.</item>
/// <item><see cref="Parameters"/> — path/query/header parameter values, as a JSON object.</item>
/// <item><see cref="RequestBodyProperties"/> — the JSON request body, as a property map.</item>
/// </list>
/// The executor always emits the sectioned envelope; any remaining top-level
/// payload entries (legacy flows, or free-form specs) are carried through in
/// <see cref="Extras"/> so the existing schema-driven builders keep working.
/// </summary>
public sealed class CustomToolPayloadSections
{
    /// <summary>
    /// Payload key carrying the additional HTTP request headers.
    /// </summary>
    public const string HeadersKey = "headers";

    /// <summary>
    /// Payload key carrying the path/query/header parameter values.
    /// </summary>
    public const string ParametersKey = "parameters";

    /// <summary>
    /// Payload key carrying the JSON request body.
    /// </summary>
    public const string RequestPayloadKey = "requestPayload";

    /// <summary>
    /// Gets the additional HTTP request headers keyed by header name.
    /// </summary>
    public Dictionary<string, object> Headers { get; } = new(StringComparer.OrdinalIgnoreCase);

    /// <summary>
    /// Gets the parameter values keyed by parameter name.
    /// </summary>
    public Dictionary<string, object> Parameters { get; } = new(StringComparer.OrdinalIgnoreCase);

    /// <summary>
    /// Gets the request body's top-level properties. Empty when the payload
    /// editor supplied nothing, or supplied a non-object body.
    /// </summary>
    public Dictionary<string, object> RequestBodyProperties { get; } = new(StringComparer.OrdinalIgnoreCase);

    /// <summary>
    /// Gets the raw request payload text when the payload editor supplied a
    /// non-object value (e.g. a JSON array, scalar or non-JSON text). Sent
    /// verbatim as the request body.
    /// </summary>
    public string? RequestPayload { get; private set; }

    /// <summary>
    /// Gets a value indicating whether the payload editor supplied a raw
    /// (non-object) value that should be forwarded verbatim.
    /// </summary>
    public bool IsRawRequestPayload => RequestPayload is not null && RequestBodyProperties.Count == 0;

    /// <summary>
    /// Gets the payload entries that are neither a section nor consumed, so
    /// free-form/legacy payloads still resolve against the operation schema.
    /// </summary>
    public Dictionary<string, object> Extras { get; } = new(StringComparer.OrdinalIgnoreCase);

    /// <summary>
    /// Splits a raw payload into the sectioned view. Returns an empty instance
    /// when the payload is <c>null</c>.
    /// </summary>
    /// <param name="payload">The inbound payload from the executor.</param>
    /// <returns>The sectioned payload.</returns>
    public static CustomToolPayloadSections From(Dictionary<string, object>? payload)
    {
        var sections = new CustomToolPayloadSections();
        if (payload is null || payload.Count == 0)
        {
            return sections;
        }

        foreach (var kvp in payload)
        {
            if (string.Equals(kvp.Key, HeadersKey, StringComparison.OrdinalIgnoreCase))
            {
                sections.CopyObjectInto(sections.Headers, kvp.Value);
                continue;
            }

            if (string.Equals(kvp.Key, ParametersKey, StringComparison.OrdinalIgnoreCase))
            {
                sections.CopyObjectInto(sections.Parameters, kvp.Value);
                continue;
            }

            if (string.Equals(kvp.Key, RequestPayloadKey, StringComparison.OrdinalIgnoreCase))
            {
                sections.AssignRequestBody(kvp.Value);
                continue;
            }

            sections.Extras[kvp.Key] = kvp.Value;
        }

        return sections;
    }

    /// <summary>
    /// Builds a single lookup dictionary for schema-driven parameter resolution:
    /// the Parameters section first, then any legacy top-level payload entries
    /// (which take precedence, matching the pre-sectioned behavior).
    /// </summary>
    /// <returns>The merged parameter values.</returns>
    public Dictionary<string, object> BuildParameterValues()
    {
        var merged = new Dictionary<string, object>(Parameters, StringComparer.OrdinalIgnoreCase);
        foreach (var kvp in Extras)
        {
            merged[kvp.Key] = kvp.Value;
        }

        return merged;
    }

    /// <summary>
    /// Assigns the Request Payload section: JSON objects are decomposed into
    /// top-level properties (so schema-driven body building applies), while
    /// arrays/scalars/non-JSON text are preserved as raw body text for verbatim
    /// forwarding.
    /// </summary>
    private void AssignRequestBody(object? value)
    {
        var element = ToJsonElement(value);
        if (element is null)
        {
            return;
        }

        if (element.Value.ValueKind == JsonValueKind.Object)
        {
            foreach (var property in element.Value.EnumerateObject())
            {
                RequestBodyProperties[property.Name] = ConvertElement(property.Value)!;
            }

            return;
        }

        // IMPORTANT NOTE: array/scalar bodies must be forwarded verbatim, not re-rendered from CLR.
        RequestPayload = element.Value.GetRawText();
    }

    /// <summary>
    /// Converts a section value (JSON string, JsonElement, or object) into a
    /// name → value map, adding each entry to <paramref name="target"/>.
    /// </summary>
    private void CopyObjectInto(Dictionary<string, object> target, object? value)
    {
        var element = ToJsonElement(value);
        if (element is null || element.Value.ValueKind != JsonValueKind.Object)
        {
            return;
        }

        foreach (var property in element.Value.EnumerateObject())
        {
            target[property.Name] = ConvertElement(property.Value)!;
        }
    }

    /// <summary>
    /// Parses a section value into a <see cref="System.Text.Json.JsonElement"/>,
    /// accepting raw JSON strings and already-deserialized JsonElement-backed objects.
    /// </summary>
    private static System.Text.Json.JsonElement? ToJsonElement(object? value)
    {
        switch (value)
        {
            case null:
                return null;

            case System.Text.Json.JsonElement element:
                return element.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null ? null : element;

            case System.Text.Json.JsonDocument document:
                return document.RootElement;

            case System.Text.Json.Nodes.JsonNode node:
                return JsonSerializer.SerializeToElement(node);

            case string text:
                if (string.IsNullOrWhiteSpace(text))
                {
                    return null;
                }

                try
                {
                    using var parsed = System.Text.Json.JsonDocument.Parse(text);
                    return parsed.RootElement.Clone();
                }
                catch (JsonException)
                {
                    return JsonSerializer.SerializeToElement(text);
                }

            default:
                return JsonSerializer.SerializeToElement(value);
        }
    }

    /// <summary>
    /// Converts a JSON element into the CLR shape used by the request builders.
    /// </summary>
    private static object? ConvertElement(System.Text.Json.JsonElement element) =>
        element.ValueKind switch
        {
            JsonValueKind.Object => element.EnumerateObject()
                .ToDictionary(property => property.Name, property => ConvertElement(property.Value)),
            JsonValueKind.Array => element.EnumerateArray().Select(ConvertElement).ToList(),
            JsonValueKind.String => element.GetString(),
            JsonValueKind.Number => element.TryGetInt64(out var longValue) ? longValue : element.GetDouble(),
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            _ => null,
        };
}
