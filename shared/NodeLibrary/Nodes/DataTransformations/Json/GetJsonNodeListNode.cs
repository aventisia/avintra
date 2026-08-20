namespace NodeLibrary.JsonNodes;

[DisplayName("Find JSON Nodes by Key"), Description("Recursively searches through a JSON structure and returns all values associated with the specified key.")]
[NodeMetadata(icon: "/assets/JSON.svg")]
public class GetJSONNodeListNode : BaseNode
{
    [DisplayName("JSON Content"), Description("The JSON content to begin searching. This can be a JSON string or a JsonNode.")]
    public required InArgument<object> JsonContent { get; set; }

    [DisplayName("Key to Find"), Description("The name of the JSON key to locate in the structure. Search is recursive and case-sensitive.")]
    public required InArgument<string> KeyToFind { get; set; }

    [DisplayName("Result List"), Description("A list of matching JsonNodes found under the specified key. If no matches are found, returns an empty list.")]
    public OutArgument<List<JsonNode>> ResultList { get; set; } = new OutArgument<List<JsonNode>>();

    protected override void Execute(INodeContext context)
    {
        var status = "";

        try
        {
            var jsonContent = JsonContent.Get(context);
            var keyToFind = KeyToFind.Get(context);
            if (jsonContent == null || string.IsNullOrWhiteSpace(keyToFind))
            {
                ResultList.Set(context, []);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, "Invalid input: JsonContent or KeyToFind is null/empty.");
                return;
            }

            // Handle various input types: string, JsonNode, ExpandoObject, or other objects
            JsonNode? jsonNode = jsonContent switch
            {
                string s => JsonNode.Parse(s),
                JsonNode node => node,
                System.Dynamic.ExpandoObject expando => JsonNode.Parse(System.Text.Json.JsonSerializer.Serialize(expando)),
                _ => JsonNode.Parse(System.Text.Json.JsonSerializer.Serialize(jsonContent))
            };

            var result = FindAllValuesHelper(jsonNode, keyToFind);
            ResultList.Set(context, result);
            status = $"Found {result.Count} matching nodes for key '{keyToFind}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ResultList.Set(context, []);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error finding JSON nodes: {ex.Message}");
        }
    }

    private static List<JsonNode> FindAllValuesHelper(JsonNode token, string keyToFind)
    {
        var results = new List<JsonNode>();
        if (token?.GetValueKind() == System.Text.Json.JsonValueKind.Object)
        {
            foreach (var property in token.AsObject())
            {
                if (property.Key == keyToFind)
                    results.Add(property.Value);
                if (property.Value != null)
                    results.AddRange(FindAllValuesHelper(property.Value, keyToFind));
            }
        }
        else if (token?.GetValueKind() == System.Text.Json.JsonValueKind.Array)
        {
            foreach (var element in token.AsArray())
            {
                if (element != null)
                    results.AddRange(FindAllValuesHelper(element, keyToFind));
            }
        }

        return results;
    }
}
