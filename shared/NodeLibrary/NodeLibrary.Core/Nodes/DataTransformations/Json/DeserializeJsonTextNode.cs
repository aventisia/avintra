namespace NodeLibrary.JsonNodes;

[DisplayName("Deserialize JSON Text"), Description("Parses a JSON string into a JsonNode object.")]
[NodeMetadata(icon: "/assets/JSON.svg")]
public class DeserializeJSONTextNode : BaseNode
{
    [DisplayName("JSON Text"), Description("The JSON string to parse into a JsonNode structure.")]
    public required InArgument<string> JsonText { get; set; }

    [DisplayName("Deserialized Token"), Description("The resulting JsonNode from the deserialization. Returns null if parsing failed.")]
    public OutArgument<JsonNode> DeserializedToken { get; set; } = new OutArgument<JsonNode>();

    [DisplayName("Deserialized JSON"), Description("The resulting JSON string from the deserialization. Returns null if parsing failed.")]
    public OutArgument<string> DeserializedJson { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "";

        try
        {
            var jsonText = JsonText.Get(context);
            if (string.IsNullOrWhiteSpace(jsonText))
            {
                DeserializedToken.Set(context, null);
                DeserializedJson.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, "Input JSON text is null or empty.");
                return;
            }

            var token = JsonNode.Parse(jsonText);
            var options = new JsonSerializerOptions { WriteIndented = true };
            var deserializedJson = JsonSerializer.Serialize(token, options);
            DeserializedToken.Set(context, token);
            DeserializedJson.Set(context, deserializedJson);
            status = "Successfully parsed JSON text into JsonNode.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            DeserializedToken.Set(context, null);
            DeserializedJson.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error deserializing JSON: {ex.Message}");
        }
    }
}
