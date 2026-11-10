namespace NodeLibrary.Helpers;

public static class NodeLogHelper
{
    /// <summary>
    /// Maximum length for any string value embedded in a logged JSON payload.
    /// Long strings are truncated <em>inside</em> the JSON tree so the emitted
    /// value remains valid JSON that the frontend JsonViewer can re-parse.
    /// </summary>
    private const int MaxJsonStringLength = 255;

    private const int MaxLoggedItems = 100;

    private const string TruncationSuffix = "...";

    public static Func<string, object, string, string?>? PlatformSpecificConvertValueForLogging { get; set; }

    public static string ConvertValueForLogging(string key, object? value, string inOrOut)
    {
        if (value is null)
            return "null";

        var converted = PlatformSpecificConvertValueForLogging?.Invoke(key, value, inOrOut);
        if (converted is not null)
            return converted;

        var valueType = value.GetType();

        if (valueType.IsGenericType && valueType.GetGenericTypeDefinition() == typeof(InArgument<>))
        {
            var innerValue = valueType.GetProperty("Value")?.GetValue(value);
            return ConvertValueForLogging(key, innerValue, inOrOut);
        }

        if (valueType.IsGenericType && valueType.GetGenericTypeDefinition() == typeof(OutArgument<>))
        {
            var innerValue = valueType.GetProperty("Value")?.GetValue(value);
            return ConvertValueForLogging(key, innerValue, inOrOut);
        }

        if (value is System.Data.DataTable dataTable)
        {
            var preview = string.Join(", ", dataTable.Columns.Cast<System.Data.DataColumn>().Select(c => c.ColumnName));
            var summary = $"DataTable with columns [{preview}]";

            try
            {
                var take = Math.Min(dataTable.Rows.Count, MaxLoggedItems);
                var rows = new List<Dictionary<string, object?>>(take);
                for (var i = 0; i < take; i++)
                {
                    var row = new Dictionary<string, object?>();
                    foreach (System.Data.DataColumn column in dataTable.Columns)
                    {
                        var cell = dataTable.Rows[i][column];
                        row[column.ColumnName] = cell is DBNull ? null : cell;
                    }
                    rows.Add(row);
                }

                var json = SerializeJsonWithTruncation(rows);
                if (json is null)
                    return summary;
                if (dataTable.Rows.Count <= take)
                    return json;

                var array = JsonNode.Parse(json)!.AsArray();
                array.Add(new JsonObject { ["_truncated"] = $"Showing first {take} of {dataTable.Rows.Count} rows" });
                return array.ToJsonString();
            }
            catch
            {
                return summary;
            }
        }

        if (value is System.Data.DataSet dataSet)
        {
            var tableNames = string.Join(", ", dataSet.Tables.Cast<System.Data.DataTable>().Select(t => t.TableName));
            return $"DataSet with tables [{tableNames}]";
        }

        if (value is byte[] bytes)
        {
            var preview = bytes.Length > 32
                ? Convert.ToHexString(bytes.AsSpan(0, 32)) + "..."
                : Convert.ToHexString(bytes);
            return $"byte[{bytes.Length}] 0x{preview}";
        }

        // JSON and complex values (JsonElement/JsonDocument/JsonNode, dictionaries,
        // non-string collections, POCOs) are serialized to a JSON tree with long
        // string values truncated inside the tree. This keeps the emitted value valid
        // JSON so the frontend JsonViewer's parseNestedStrings can render it as a
        // tree instead of a plain string. Plain strings and primitives fall through to
        // the simple truncation below.
        if (IsJsonOrComplexValue(value))
        {
            var json = SerializeJsonWithTruncation(value);
            if (json is not null)
                return json;
        }

        var stringValue = value.ToString() ?? "";
        return stringValue.Length > MaxJsonStringLength ? stringValue[..MaxJsonStringLength] + TruncationSuffix : stringValue;
    }

    /// <summary>
    /// Determines whether a value should be logged as JSON rather than via
    /// <see cref="object.ToString"/>. Covers JSON primitives and complex objects;
    /// plain strings and simple scalars are excluded.
    /// </summary>
    private static bool IsJsonOrComplexValue(object value)
    {
        if (value is JsonElement or JsonDocument or JsonNode)
            return true;

        var type = value.GetType();
        if (type.IsPrimitive || type.IsEnum)
            return false;

        if (value is string)
            return false;

        if (value is System.Collections.IDictionary or System.Collections.Generic.IDictionary<string, object?>)
            return true;

        if (value is System.Collections.IEnumerable)
            return true;

        // Fall back to treating any non-scalar reference type as JSON-serializable.
        return !type.IsValueType;
    }

    /// <summary>
    /// Serializes a value to a compact JSON string, truncating long string values and
    /// capping collections inside the tree so the result remains valid JSON. Returns null
    /// when the value cannot be serialized (e.g. cyclic references or unsupported types).
    /// </summary>
    private static string? SerializeJsonWithTruncation(object value)
    {
        try
        {
            var node = value switch
            {
                JsonElement element => JsonNode.Parse(element.GetRawText()),
                JsonDocument document => JsonNode.Parse(document.RootElement.GetRawText()),
                JsonNode jsonNode => jsonNode.DeepClone(),
                System.Collections.IEnumerable items when value is not string
                    and not System.Collections.IDictionary
                    and not System.Collections.Generic.IDictionary<string, object?> =>
                    JsonSerializer.SerializeToNode(items.Cast<object?>().Take(MaxLoggedItems + 1).ToList()),
                _ => JsonSerializer.SerializeToNode(value),
            };

            if (node is null)
                return null;

            TruncateNode(node);
            return node.ToJsonString();
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Recursively truncates long string values and oversized arrays within a JSON tree,
    /// preserving the tree structure so the serialized output remains valid JSON.
    /// </summary>
    private static void TruncateNode(JsonNode? node)
    {
        switch (node)
        {
            case JsonObject obj:
                foreach (var property in obj.ToList())
                {
                    if (property.Value is JsonValue jsonValue && jsonValue.TryGetValue<string>(out var str))
                    {
                        obj[property.Key] = TruncateString(str);
                    }
                    else
                    {
                        TruncateNode(property.Value);
                    }
                }
                break;

            case JsonArray array:
                if (array.Count > MaxLoggedItems)
                {
                    while (array.Count > MaxLoggedItems)
                        array.RemoveAt(array.Count - 1);
                    array.Add(new JsonObject { ["_truncated"] = $"Showing first {MaxLoggedItems} items" });
                }

                for (var i = 0; i < array.Count; i++)
                {
                    if (array[i] is JsonValue jsonValue && jsonValue.TryGetValue<string>(out var str))
                    {
                        array[i] = TruncateString(str);
                    }
                    else
                    {
                        TruncateNode(array[i]);
                    }
                }
                break;
        }
    }

    private static string TruncateString(string value) =>
        value.Length > MaxJsonStringLength ? value[..MaxJsonStringLength] + TruncationSuffix : value;
}
