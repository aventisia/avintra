namespace NodeLibrary.Converters;

/// <summary>
/// Custom JsonConverter that truncates long string values during serialization to prevent logging massive base64 or other large content
/// </summary>
public class TruncatingJsonConverter : JsonConverter<object>
{
    private const int MAX_FIELD_LENGTH = 500; // Maximum characters for any field value
    private const string TRUNCATION_SUFFIX = "... [truncated]";

    public override bool CanConvert(Type typeToConvert)
    {
        // Handle all types, but we'll specifically truncate strings
        return true;
    }

    public override object Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        // Not used for logging, but required by interface
        throw new NotImplementedException("Deserialization is not supported");
    }

    public override void Write(Utf8JsonWriter writer, object value, JsonSerializerOptions options)
    {
        if (value == null)
        {
            writer.WriteNullValue();
            return;
        }

        // Handle string truncation
        if (value is string stringValue)
        {
            if (stringValue.Length > MAX_FIELD_LENGTH)
            {
                writer.WriteStringValue(stringValue.Substring(0, MAX_FIELD_LENGTH) + TRUNCATION_SUFFIX);
            }
            else
            {
                writer.WriteStringValue(stringValue);
            }
            return;
        }

        // Handle primitive types
        if (value is int intValue)
        {
            writer.WriteNumberValue(intValue);
            return;
        }
        if (value is long longValue)
        {
            writer.WriteNumberValue(longValue);
            return;
        }
        if (value is double doubleValue)
        {
            writer.WriteNumberValue(doubleValue);
            return;
        }
        if (value is float floatValue)
        {
            writer.WriteNumberValue(floatValue);
            return;
        }
        if (value is decimal decimalValue)
        {
            writer.WriteNumberValue(decimalValue);
            return;
        }
        if (value is bool boolValue)
        {
            writer.WriteBooleanValue(boolValue);
            return;
        }
        if (value is DateTime dateTimeValue)
        {
            writer.WriteStringValue(dateTimeValue.ToString("o"));
            return;
        }
        if (value is Guid guidValue)
        {
            writer.WriteStringValue(guidValue.ToString());
            return;
        }

        // Handle arrays/lists
        if (value is IEnumerable enumerable && value is not string)
        {
            writer.WriteStartArray();
            var count = 0;
            foreach (var item in enumerable)
            {
                if (count++ >= 100) break; // Limit to 100 items
                Write(writer, item, options);
            }
            writer.WriteEndArray();
            return;
        }

        // Handle objects with properties/fields
        try
        {
            writer.WriteStartObject();
            var type = value.GetType();

            // Serialize public properties
            foreach (var prop in type.GetProperties())
            {
                if (prop.CanRead)
                {
                    try
                    {
                        var propValue = prop.GetValue(value);
                        writer.WritePropertyName(prop.Name);
                        if (propValue != null)
                        {
                            Write(writer, propValue, options);
                        }
                        else
                        {
                            writer.WriteNullValue();
                        }
                    }
                    catch
                    {
                        writer.WritePropertyName(prop.Name);
                        writer.WriteStringValue("[Error reading property]");
                    }
                }
            }

            writer.WriteEndObject();
        }
        catch
        {
            // Fallback: just write the ToString() value
            var fallback = value.ToString() ?? "null";
            if (fallback.Length > MAX_FIELD_LENGTH)
            {
                writer.WriteStringValue(fallback.Substring(0, MAX_FIELD_LENGTH) + TRUNCATION_SUFFIX);
            }
            else
            {
                writer.WriteStringValue(fallback);
            }
        }
    }
}
