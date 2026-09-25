using System.Collections;
using System.Globalization;

// Both Newtonsoft.Json and System.Text.Json are globally imported in this
// project, so the shared type names must be aliased explicitly.
using JsonElement = System.Text.Json.JsonElement;
using JsonException = System.Text.Json.JsonException;
using JsonNode = System.Text.Json.Nodes.JsonNode;
using JsonSerializer = System.Text.Json.JsonSerializer;
using JsonValueKind = System.Text.Json.JsonValueKind;

namespace WorkspaceAPIs.Features.Corsair.Helpers;

/// <summary>
/// Normalizes the raw payload produced by a Corsair connector node before it is
/// forwarded to the sidecar.
///
/// The node payload is built from the ReactFlow node inputs, which are stored as
/// strings by the Studio form controls and include every configured field —
/// including empty optional fields and UI-only fields such as the credential
/// selector and the OnError group. The sidecar validates the payload against the
/// plugin's declared input schema, so this helper:
/// <list type="bullet">
///   <item>keeps only the properties declared as inputs in the generated config,</item>
///   <item>drops null, empty, and whitespace-only values,</item>
///   <item>coerces each value to the type declared by the config field.</item>
/// </list>
/// Values that cannot be coerced to the declared type are dropped rather than
/// forwarded, so the sidecar never receives a wrongly typed property.
/// </summary>
public static class CorsairPayloadHelper
{
    /// <summary>
    /// Refines <paramref name="payload"/> against the generated config for the
    /// invoked action.
    /// </summary>
    /// <param name="payload">Raw payload received from the connector node.</param>
    /// <param name="config">
    /// Generated config for the invoked action. When <c>null</c> (config file
    /// unavailable) only empty values are removed, because the declared field
    /// names and types are unknown.
    /// </param>
    /// <returns>The refined payload ready to be forwarded to the sidecar.</returns>
    public static Dictionary<string, object?> Refine(
        IReadOnlyDictionary<string, object>? payload,
        CorsairConnectorConfig? config)
    {
        var refined = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
        if (payload is null || payload.Count == 0)
        {
            return refined;
        }

        var fields = BuildInputFieldLookup(config);

        foreach (var (key, rawValue) in payload)
        {
            if (string.IsNullOrWhiteSpace(key))
            {
                continue;
            }

            // Only forward properties the action actually declares as inputs.
            // UI-only fields (credential selector, OnError group) and stale keys
            // from older config versions are dropped here.
            CorsairConnectorField? field = null;
            if (fields is not null && !fields.TryGetValue(key, out field))
            {
                continue;
            }

            var value = Normalize(rawValue);
            if (IsEmpty(value))
            {
                continue;
            }

            var coerced = field is null ? value : Coerce(value, field.Type);

            // A value that cannot be represented as the declared type (or that
            // collapses to an empty collection/object) is dropped rather than
            // forwarded as null.
            if (IsEmpty(coerced))
            {
                continue;
            }

            refined[key] = coerced;
        }

        return refined;
    }

    /// <summary>
    /// Builds a case-insensitive lookup of the declared input fields. Returns
    /// <c>null</c> when no config is available so callers skip field filtering.
    /// </summary>
    private static Dictionary<string, CorsairConnectorField>? BuildInputFieldLookup(CorsairConnectorConfig? config)
    {
        if (config?.Fields is null)
        {
            return null;
        }

        var lookup = new Dictionary<string, CorsairConnectorField>(StringComparer.OrdinalIgnoreCase);
        foreach (var field in config.Fields)
        {
            if (field is null || string.IsNullOrWhiteSpace(field.Name))
            {
                continue;
            }

            if (!string.Equals(field.Direction, "Input", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            // Double-underscore fields are UI-only (credential selector, OnError
            // group) and are never part of the provider payload.
            if (field.Name.StartsWith("__", StringComparison.Ordinal))
            {
                continue;
            }

            lookup[field.Name] = field;
        }

        return lookup;
    }

    /// <summary>
    /// Converts JSON-backed values into plain CLR objects so the rest of the
    /// refinement works on a single representation.
    /// </summary>
    private static object? Normalize(object? value) => value switch
    {
        null => null,
        JsonElement element => FromJsonElement(element),
        JsonNode node => FromJsonElement(JsonSerializer.SerializeToElement(node)),
        _ => value,
    };

    private static object? FromJsonElement(JsonElement element) => element.ValueKind switch
    {
        JsonValueKind.Object => element.EnumerateObject()
            .ToDictionary(p => p.Name, p => FromJsonElement(p.Value), StringComparer.OrdinalIgnoreCase),
        JsonValueKind.Array => element.EnumerateArray().Select(FromJsonElement).ToList(),
        JsonValueKind.String => element.GetString(),
        JsonValueKind.Number => element.TryGetInt64(out var l) ? l : element.GetDouble(),
        JsonValueKind.True => true,
        JsonValueKind.False => false,
        // Null and Undefined are treated as absent.
        _ => null,
    };

    /// <summary>
    /// Treats null, blank strings, and empty collections as "not provided".
    /// </summary>
    private static bool IsEmpty(object? value) => value switch
    {
        null => true,
        string s => string.IsNullOrWhiteSpace(s),
        IDictionary dictionary => dictionary.Count == 0,
        ICollection collection => collection.Count == 0,
        _ => false,
    };

    /// <summary>
    /// Coerces a value to the type declared by the DCP field type. Returns
    /// <c>null</c> when the value cannot be represented as that type.
    /// </summary>
    private static object? Coerce(object? value, string? fieldType) => fieldType switch
    {
        "number" => ToNumber(value),
        "checkbox" or "switch" => ToBoolean(value),
        "tag-input" or "string-array" => ToArray(value),
        "json-editor" => ToJsonObject(value),
        _ => ToText(value),
    };

    private static object? ToNumber(object? value)
    {
        switch (value)
        {
            case long or int or decimal:
                return value;
            case double d:
                return double.IsFinite(d) ? d : null;
            case float f:
                return float.IsFinite(f) ? f : null;
            case bool b:
                return b ? 1L : 0L;
            case string s:
                if (long.TryParse(s, NumberStyles.Integer, CultureInfo.InvariantCulture, out var l))
                {
                    return l;
                }
                if (double.TryParse(s, NumberStyles.Float, CultureInfo.InvariantCulture, out var parsed) && double.IsFinite(parsed))
                {
                    return parsed;
                }
                return null;
            default:
                return null;
        }
    }

    private static object? ToBoolean(object? value)
    {
        switch (value)
        {
            case bool b:
                return b;
            case string s when bool.TryParse(s, out var parsed):
                return parsed;
            case string s when s.Trim() == "1":
                return true;
            case string s when s.Trim() == "0":
                return false;
            case long l:
                return l != 0;
            default:
                return null;
        }
    }

    private static object? ToArray(object? value)
    {
        switch (value)
        {
            case string s:
                // tag-input stores arrays as JSON strings; fall back to a
                // comma-separated split for values typed by hand.
                var trimmed = s.Trim();
                if (trimmed.StartsWith('['))
                {
                    try
                    {
                        using var document = JsonDocument.Parse(trimmed);
                        if (document.RootElement.ValueKind == JsonValueKind.Array)
                        {
                            return document.RootElement.EnumerateArray().Select(FromJsonElement).ToList();
                        }
                    }
                    catch (JsonException)
                    {
                        // Fall through to the comma-separated split.
                    }
                }

                return trimmed
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .Cast<object?>()
                    .ToList();
            // A dictionary is not a valid array value; let it be dropped.
            case IDictionary:
                return null;
            case IEnumerable<object?> enumerable:
                return enumerable.ToList();
            case IEnumerable enumerable:
                return enumerable.Cast<object?>().ToList();
            default:
                return null;
        }
    }

    private static object? ToJsonObject(object? value)
    {
        if (value is IDictionary<string, object?> dictionary)
        {
            return dictionary;
        }

        if (value is not string s)
        {
            return null;
        }

        var trimmed = s.Trim();
        if (!trimmed.StartsWith('{'))
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(trimmed);
            return document.RootElement.ValueKind == JsonValueKind.Object
                ? FromJsonElement(document.RootElement)
                : null;
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static object? ToText(object? value) => value switch
    {
        string s => s,
        bool b => b ? "true" : "false",
        long or int or double or decimal or float => Convert.ToString(value, CultureInfo.InvariantCulture),
        _ => null,
    };
}
