using System.Collections;
using System.Dynamic;

namespace ExecutorLibrary.FlowProcessor;

/// <summary>
/// Centralized converter that turns JSON primitives, objects, and arrays into
/// interpreter-friendly dynamic objects used by <see cref="FlowExecutionContext"/>
/// and <see cref="FlowProcessor"/>.
/// </summary>
/// <remarks>
/// <para>
/// The legacy code used <see cref="ExpandoObject"/>, which supports dot-notation
/// (e.g. <c>obj.Key</c>) but does NOT support string indexing (e.g.
/// <c>obj["Key"]</c>) through the C# runtime binder. This converter uses
/// <see cref="DynamicJson"/> instead, which supports both access patterns.
/// </para>
/// </remarks>
internal static class JsonToDynamicConverter
{
    /// <summary>
    /// Recursively converts an arbitrary value into a form that DynamicExpresso can
    /// evaluate with dot-notation and indexing. JsonElements / JsonNodes become
    /// <see cref="DynamicJson"/> objects or lists, and nested dictionaries/enumerables
    /// are flattened the same way.
    /// </summary>
    public static object? ConvertForInterpreter(object? value)
    {
        if (value is null)
            return null;

        if (value is JsonElement element)
            return ConvertJsonElement(element);

        if (value is JsonNode node)
            return ConvertJsonNode(node);

        if (value is string)
            return value;

        if (value is IDictionary dictionary)
        {
            var dyn = new DynamicJson();
            foreach (var key in dictionary.Keys)
            {
                var keyString = key?.ToString();
                if (!string.IsNullOrWhiteSpace(keyString) && key is not null)
                {
                    dyn[keyString] = ConvertForInterpreter(dictionary[key]);
                }
            }
            return dyn;
        }

        // DynamicJson, ExpandoObject and other generic string-keyed dictionaries must be
        // preserved as objects so dot-notation (e.g. CurrentItem.name) works in DynamicExpresso.
        if (value is IDictionary<string, object?> genericDictionary)
        {
            var dyn = new DynamicJson();
            foreach (var kvp in genericDictionary)
            {
                if (!string.IsNullOrWhiteSpace(kvp.Key))
                {
                    dyn[kvp.Key] = ConvertForInterpreter(kvp.Value);
                }
            }
            return dyn;
        }

        if (value is IEnumerable enumerable)
        {
            return ConvertEnumerable(enumerable.Cast<object?>());
        }

        return value;
    }

    /// <summary>
    /// Recursively converts a <see cref="JsonElement"/> into a form suitable for
    /// DynamicExpresso evaluation. Objects become <see cref="DynamicJson"/>,
    /// arrays become lists, and primitives are unwrapped.
    /// </summary>
    public static object? ConvertJsonElement(JsonElement element)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.Object:
                var dyn = new DynamicJson();
                foreach (var property in element.EnumerateObject())
                {
                    dyn[property.Name] = ConvertJsonElement(property.Value);
                }
                return dyn;

            case JsonValueKind.Array:
                return ConvertEnumerable(element.EnumerateArray().Select(ConvertJsonElement));

            case JsonValueKind.String:
                return element.GetString();

            case JsonValueKind.Number:
                return element.TryGetInt64(out var longValue) ? longValue : element.GetDouble();

            case JsonValueKind.True:
                return true;

            case JsonValueKind.False:
                return false;

            case JsonValueKind.Null:
            case JsonValueKind.Undefined:
                return null;

            default:
                return element.GetRawText();
        }
    }

    /// <summary>
    /// Recursively converts a <see cref="JsonNode"/> into a form suitable for
    /// DynamicExpresso evaluation.
    /// </summary>
    public static object? ConvertJsonNode(JsonNode? node)
    {
        if (node is null)
            return null;

        if (node is JsonObject jsonObject)
        {
            var dyn = new DynamicJson();
            foreach (var property in jsonObject)
            {
                if (!string.IsNullOrWhiteSpace(property.Key))
                {
                    dyn[property.Key] = ConvertJsonNode(property.Value);
                }
            }
            return dyn;
        }

        if (node is JsonArray jsonArray)
        {
            return ConvertEnumerable(jsonArray.Select(ConvertJsonNode));
        }

        if (node is JsonValue jsonValue)
        {
            var value = jsonValue.GetValue<object?>();
            return value is JsonElement nestedElement ? ConvertJsonElement(nestedElement) : value;
        }

        return node.ToString();
    }

    /// <summary>
    /// Converts a sequence of interpreter-friendly values into a strongly-typed list
    /// when possible. If every element is a <see cref="DynamicJson"/> we return
    /// <see cref="List{DynamicJson}"/> so that indexers preserve the dynamic type
    /// and DynamicExpresso can resolve dot-notation and string indexing like
    /// <c>list[2].Value["nested key"]</c>.
    /// Otherwise we fall back to <see cref="List{Object}"/>.
    /// </summary>
    public static object ConvertEnumerable(IEnumerable<object?> items)
    {
        var converted = items.Select(ConvertForInterpreter).ToList();
        if (converted.Count > 0 && converted.All(i => i is DynamicJson))
        {
            return converted.Cast<DynamicJson>().ToList();
        }

        return converted;
    }
}
