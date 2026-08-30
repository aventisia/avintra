namespace NodeLibrary.JsonNodes;

[DisplayName("Serialize JSON Token"), Description("Converts a JsonNode or object into both JSON string and JsonNode.")]
[NodeMetadata(icon: "/assets/JSON.svg")]
public class SerializeJSONNode : BaseNode
{
    [DisplayName("Input Token"), Description("The JsonNode or object to serialize into JSON text.")]
    public required InArgument<JsonNode> InputToken { get; set; }

    [DisplayName("Serialized JSON"), Description("The resulting JSON string from serialization. Returns null if serialization failed.")]
    public OutArgument<string> SerializedJson { get; set; } = new OutArgument<string>();

    [DisplayName("Serialized Token"), Description("The resulting JsonNode from serialization. Returns null if serialization failed.")]
    public OutArgument<JsonNode> SerializedToken { get; set; } = new OutArgument<JsonNode>();

    protected override void Execute(INodeContext context)
    {
        var status = "";

        try
        {
            var token = InputToken.Get(context);

            if (token == null)
            {
                SerializedJson.Set(context, null!);
                SerializedToken.Set(context, null!);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, "Input token is null. Cannot serialize.");
                return;
            }

            // Serialize with indentation for readability
            var options = new JsonSerializerOptions { WriteIndented = true };
            var serializedJson = JsonSerializer.Serialize(token, options);

            // Parse back into JsonNode to give both outputs
            var serializedToken = JsonNode.Parse(serializedJson);

            SerializedJson.Set(context, serializedJson);
            SerializedToken.Set(context, serializedToken);

            status = "Successfully serialized JsonNode into JSON string and JsonNode.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            SerializedJson.Set(context, null!);
            SerializedToken.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error serializing JSON: {ex.Message}");
        }
    }
}
