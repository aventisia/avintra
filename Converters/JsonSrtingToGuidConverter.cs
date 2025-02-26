namespace AspNetToolkit.Converters;

public class JsonSrtingToGuidConverter : System.Text.Json.Serialization.JsonConverter<Guid>
{
    public override Guid Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String && Guid.TryParse(reader.GetString(), out var guid))
        {
            return guid;
        }
        throw new System.Text.Json.JsonException("Invalid GUID format.");
    }

    public override void Write(Utf8JsonWriter writer, Guid value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString());
    }
}