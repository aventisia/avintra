using System.Reflection;
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

        // Handle string target
        if (targetType == typeof(string))
            return value.ToString();

        // Handle JsonElement — deserialize to target type
        if (value is JsonElement jsonElement)
            return DeserializeJsonElement(jsonElement, targetType);

        // Handle string source — try parsing for known types
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
            // Fast paths for common primitives
            if (targetType == typeof(string))
                return element.ValueKind == JsonValueKind.String ? element.GetString() : element.GetRawText();

            if (targetType == typeof(int) && element.TryGetInt32(out var intVal))
                return intVal;

            if (targetType == typeof(long) && element.TryGetInt64(out var longVal))
                return longVal;

            if (targetType == typeof(double) && element.TryGetDouble(out var dblVal))
                return dblVal;

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

        // Try JSON deserialization for complex types from string
        try
        {
            return JsonSerializer.Deserialize(str, targetType);
        }
        catch
        {
            return targetType.IsValueType ? Activator.CreateInstance(targetType) : null;
        }
    }
}
