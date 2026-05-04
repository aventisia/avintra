namespace NodeLibrary.JsonNodes;

[DisplayName("Get First JSON Node by Key"), Description("Recursively searches through a JSON structure and returns the first value associated with the specified key.")]
[NodeMetadata(icon: "/assets/JSON.svg")]
public class GetJSONNodeNode : BaseNode
{
    [DisplayName("JSON Content"), Description("The JSON content to begin searching. This can be a JSON string or a JsonNode.")]
    public required InArgument<object> JsonContent { get; set; }

    [DisplayName("Key to Find"), Description("The name of the JSON key to locate in the structure. Search is recursive and case-sensitive.")]
    public required InArgument<string> KeyToFind { get; set; }

    [DisplayName("Result Node"), Description("The first matching JsonNode found under the specified key. Returns null if no match is found or an error occurs.")]
    public OutArgument<JsonNode> ResultNode { get; set; } = new OutArgument<JsonNode>();

    protected override void Execute(INodeContext context)
    {
        var status = "";

        try
        {
            var jsonContent = JsonContent.Get(context);
            var keyToFind = KeyToFind.Get(context);
            if (jsonContent == null || string.IsNullOrWhiteSpace(keyToFind))
            {
                ResultNode.Set(context, null!);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, "Invalid input: JsonContent or KeyToFind is null/empty.");
                return;
            }

            var jsonNode = jsonContent is string
                ? JsonNode.Parse((string)jsonContent)
                : (JsonNode)jsonContent;

            var result = FindValueHelper(jsonNode, keyToFind);
            ResultNode.Set(context, result);

            if (result != null)
            {
                status = $"Found matching node for key '{keyToFind}'.";
                IsSuccess.Set(context, true);
            }
            else
            {
                status = $"No matching node found for key '{keyToFind}'.";
                IsSuccess.Set(context, false);
            }

            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ResultNode.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error finding JSON node: {ex.Message}");
        }
    }

    private static JsonNode FindValueHelper(JsonNode token, string keyToFind)
    {
        if (token?.GetValueKind() == System.Text.Json.JsonValueKind.Object)
        {
            foreach (var property in token.AsObject())
            {
                if (property.Key == keyToFind)
                    return property.Value;
                var result = FindValueHelper(property.Value, keyToFind);
                if (result != null)
                    return result;
            }
        }
        else if (token?.GetValueKind() == System.Text.Json.JsonValueKind.Array)
        {
            foreach (var element in token.AsArray())
            {
                var result = FindValueHelper(element, keyToFind);
                if (result != null)
                    return result;
            }
        }

        return null;
    }
}
