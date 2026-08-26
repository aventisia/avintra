using System.Collections;
using System.Reflection;
using ExecutorLibrary.FlowProcessor;
using NodeLibrary.Core;

namespace ExecutorLibrary.Helpers;

public static class NodeArgumentHelper
{
    /// <summary>
    /// Converts a raw value to the specified target type.
    /// Handles primitives, strings, JsonElement, and complex types via JsonSerializer.
    /// </summary>
    public static object? ConvertToType(object? value, Type targetType)
    {
        if (value is null)
            return targetType.IsValueType ? Activator.CreateInstance(targetType) : null;

        if (targetType.IsInstanceOfType(value))
            return value;

        // Preserve COM objects as-is. JSON round-tripping an RCW destroys its
        // interface mapping and leaves a plain System.__ComObject that cannot be
        // late-bound by downstream dynamic calls.
        if (value.GetType().IsCOMObject)
            return value;

        // Handle string target
        if (targetType == typeof(string))
        {
            // DataTable: render as CSV, matching the legacy ActivityExecutorService behavior.
            if (value is System.Data.DataTable dt)
            {
                var sb = new System.Text.StringBuilder();
                var columns = dt.Columns.Cast<System.Data.DataColumn>().Select(c => c.ColumnName);
                sb.AppendLine(string.Join(",", columns));
                foreach (System.Data.DataRow row in dt.Rows)
                    sb.AppendLine(string.Join(",", row.ItemArray.Select(x => x?.ToString() ?? "")));
                return sb.ToString().Trim();
            }

            // IEnumerable (including lists/arrays of dynamic objects), DynamicJson,
            // ExpandoObject, and dictionary-backed dynamic objects have a useless ToString();
            // serialize them as JSON so template outputs like {{ai_model_result.output}}
            // render as structured data instead of the class name.
            if ((value is IEnumerable enumerable && value is not string)
                || value is DynamicJson
                || value is System.Dynamic.ExpandoObject
                || value is IDictionary<string, object?>)
            {
                return SerializeOrToString(value);
            }

            return value.ToString();
        }

        // Handle JsonElement — deserialize to target type
        if (value is JsonElement jsonElement)
            return DeserializeJsonElement(jsonElement, targetType);

        // Handle SecureString target from plain string
        if (targetType == typeof(System.Security.SecureString) && value is string secureStr)
        {
            var secureString = new System.Security.SecureString();
            foreach (char c in secureStr)
                secureString.AppendChar(c);
            secureString.MakeReadOnly();
            return secureString;
        }

        // Handle arrays from comma-separated string or JSON array (legacy ActivityExecutorService behavior)
        if (targetType.IsArray && value is string arrStr)
        {
            var elemType = targetType.GetElementType()!;
            var trimmed = arrStr.Trim();
            if (trimmed.StartsWith("["))
            {
                try
                {
                    var deserialized = JsonSerializer.Deserialize(arrStr, targetType);
                    if (deserialized is not null)
                        return deserialized;
                }
                catch { /* fall through to comma-split */ }
            }

            var items = arrStr.Split(',').Select(s => ConvertToType(s.Trim(), elemType)).ToArray();
            var array = Array.CreateInstance(elemType, items.Length);
            for (int i = 0; i < items.Length; i++)
                array.SetValue(items[i], i);
            return array;
        }

        // Handle List<T> from comma-separated string, JSON array, or IEnumerable (legacy behavior)
        if (targetType.IsGenericType && targetType.GetGenericTypeDefinition() == typeof(List<>))
        {
            var elemType = targetType.GetGenericArguments()[0];
            var list = (IList)Activator.CreateInstance(targetType)!;

            if (value is string listStr)
            {
                var trimmed = listStr.Trim();
                if (trimmed.StartsWith("["))
                {
                    try
                    {
                        var deserialized = JsonSerializer.Deserialize(listStr, targetType);
                        if (deserialized is not null)
                            return deserialized;
                    }
                    catch { /* fall through to comma-split */ }
                }

                foreach (var item in listStr.Split(','))
                    list.Add(ConvertToType(item.Trim(), elemType));
                return list;
            }

            if (value is IEnumerable enumerable)
            {
                foreach (var item in enumerable)
                    list.Add(ConvertToType(item, elemType));
                return list;
            }
        }

        // Handle string source — try parsing for known types (must run after collection
        // handling so a single plain string like a file path can become a one-item List<T>).
        if (value is string str)
            return ConvertFromString(str, targetType);


        // Try Convert.ChangeType for primitives
        try
        {
            var underlyingType = Nullable.GetUnderlyingType(targetType) ?? targetType;
            return Convert.ChangeType(value, underlyingType);
        }
        catch
        {
            // Fallback: serialize then deserialize for complex types
            try
            {
                var json = JsonSerializer.Serialize(value);
                return JsonSerializer.Deserialize(json, targetType);
            }
            catch
            {
                return targetType.IsValueType ? Activator.CreateInstance(targetType) : null;
            }
        }
    }

    /// <summary>
    /// Creates an InArgument&lt;T&gt; for the given generic argument type with the specified value.
    /// </summary>
    public static object CreateInArgument(Type genericArgType, object? convertedValue)
    {
        var inArgType = typeof(InArgument<>).MakeGenericType(genericArgType);

        if (convertedValue is null)
            return Activator.CreateInstance(inArgType)!;

        return Activator.CreateInstance(inArgType, convertedValue)!;
    }

    /// <summary>
    /// Creates an empty OutArgument&lt;T&gt; for the given generic argument type.
    /// </summary>
    public static object CreateOutArgument(Type genericArgType)
    {
        var outArgType = typeof(OutArgument<>).MakeGenericType(genericArgType);
        return Activator.CreateInstance(outArgType)!;
    }

    /// <summary>
    /// Reads the Value from a NodeArgument (InArgument or OutArgument) instance.
    /// </summary>
    public static object? ReadArgumentValue(object argumentInstance)
    {
        if (argumentInstance is NodeArgument nodeArg)
            return nodeArg.Value;

        return null;
    }

    /// <summary>
    /// Extracts the generic type argument T from InArgument&lt;T&gt; or OutArgument&lt;T&gt;.
    /// Returns null if the property type is not a generic NodeArgument.
    /// </summary>
    public static Type? GetGenericArgumentType(PropertyInfo property)
    {
        var propType = property.PropertyType;
        if (!propType.IsGenericType)
            return null;

        var genericDef = propType.GetGenericTypeDefinition();
        if (genericDef == typeof(InArgument<>) || genericDef == typeof(OutArgument<>))
            return propType.GetGenericArguments()[0];

        return null;
    }

    /// <summary>
    /// Returns true if the property type is InArgument&lt;T&gt;.
    /// </summary>
    public static bool IsInArgument(PropertyInfo property)
    {
        return property.PropertyType.IsGenericType
            && property.PropertyType.GetGenericTypeDefinition() == typeof(InArgument<>);
    }

    /// <summary>
    /// Returns true if the property type is OutArgument&lt;T&gt;.
    /// </summary>
    public static bool IsOutArgument(PropertyInfo property)
    {
        return property.PropertyType.IsGenericType
            && property.PropertyType.GetGenericTypeDefinition() == typeof(OutArgument<>);
    }

    private static object? DeserializeJsonElement(JsonElement element, Type targetType)
    {
        try
        {
            // Fast path for string target
            if (targetType == typeof(string))
                return element.ValueKind == JsonValueKind.String ? element.GetString() : element.GetRawText();

            // When the JsonElement holds a string value (e.g. "1" instead of 1),
            // extract the string and parse it via ConvertFromString
            if (element.ValueKind == JsonValueKind.String)
            {
                var str = element.GetString();
                return str is not null ? ConvertFromString(str, targetType) : (targetType.IsValueType ? Activator.CreateInstance(targetType) : null);
            }

            // Fast paths for numeric JsonElements
            if (targetType == typeof(int) && element.TryGetInt32(out var intVal))
                return intVal;

            if (targetType == typeof(long) && element.TryGetInt64(out var longVal))
                return longVal;

            if (targetType == typeof(double) && element.TryGetDouble(out var dblVal))
                return dblVal;

            if (targetType == typeof(float) && element.TryGetDouble(out var floatVal))
                return (float)floatVal;

            if (targetType == typeof(decimal) && element.TryGetDecimal(out var decVal))
                return decVal;

            if (targetType == typeof(bool) && element.ValueKind is JsonValueKind.True or JsonValueKind.False)
                return element.GetBoolean();

            // General deserialization
            return element.Deserialize(targetType);
        }
        catch
        {
            return targetType.IsValueType ? Activator.CreateInstance(targetType) : null;
        }
    }

    private static object? ConvertFromString(string str, Type targetType)
    {
        var underlying = Nullable.GetUnderlyingType(targetType) ?? targetType;

        if (underlying == typeof(int) && int.TryParse(str, out var i)) return i;
        if (underlying == typeof(long) && long.TryParse(str, out var l)) return l;
        if (underlying == typeof(double) && double.TryParse(str, out var d)) return d;
        if (underlying == typeof(float) && float.TryParse(str, out var f)) return f;
        if (underlying == typeof(decimal) && decimal.TryParse(str, out var m)) return m;
        if (underlying == typeof(bool) && bool.TryParse(str, out var b)) return b;
        if (underlying == typeof(Guid) && Guid.TryParse(str, out var g)) return g;
        if (underlying == typeof(DateTime) && DateTime.TryParse(str, out var dt)) return dt;
        if (underlying == typeof(DateTimeOffset) && DateTimeOffset.TryParse(str, out var dto)) return dto;

        // Parse enum values from their string name or numeric value
        if (underlying.IsEnum)
        {
            if (Enum.TryParse(underlying, str, ignoreCase: true, out var enumValue))
                return enumValue;

            // If a numeric string was provided, TryParse already handles it; reaching here means unparseable.
            return targetType.IsValueType ? Activator.CreateInstance(targetType) : null;
        }

        // Try JSON deserialization for complex types from string
        return DeserializeJson(str, targetType);
    }

    /// <summary>
    /// Serializes an object to JSON, falling back to its <see cref="object.ToString"/> value
    /// when serialization fails (e.g., for cycles or unsupported types).
    /// </summary>
    private static string SerializeOrToString(object? value)
    {
        try
        {
            return JsonSerializer.Serialize(value);
        }
        catch
        {
            return value?.ToString() ?? string.Empty;
        }
    }

    /// <summary>
    /// Deserializes a JSON string to the specified target type, returning the default value
    /// for value types when deserialization fails.
    /// </summary>
    private static object? DeserializeJson(string json, Type targetType)
    {
        try
        {
            return JsonSerializer.Deserialize(json, targetType);
        }
        catch
        {
            return targetType.IsValueType ? Activator.CreateInstance(targetType) : null;
        }
    }
}
