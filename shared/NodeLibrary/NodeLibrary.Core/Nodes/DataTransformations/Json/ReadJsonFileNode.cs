namespace NodeLibrary.JsonNodes;

[DisplayName("Read JSON File"), Description("Reads the contents of a JSON file from the specified file path.")]
[NodeMetadata(icon: "/assets/JSON.svg")]
public class ReadJSONFileNode : BaseNode
{
    [DisplayName("File Path"), Description("The full path to the JSON file to be read.")]
    public required InArgument<string> FilePath { get; set; }

    [DisplayName("JSON Content (String)"), Description("The content of the JSON file as a string. Returns \"null\" if an error occurred while reading the file.")]
    public OutArgument<string> JsonContentString { get; set; } = new OutArgument<string>();

    [DisplayName("JSON Content (JsonNode)"), Description("The content of the JSON file as a JsonNode. Returns null if an error occurred while reading the file.")]
    public OutArgument<JsonNode> JsonContentToken { get; set; } = new OutArgument<JsonNode>();

    protected override void Execute(INodeContext context)
    {
        var status = "";

        try
        {
            var filePath = FilePath.Get(context);
            if (string.IsNullOrWhiteSpace(filePath))
            {
                JsonContentString.Set(context, "null");
                JsonContentToken.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, "File path is null or empty.");
                return;
            }

            // Check if file exists
            if (!File.Exists(filePath))
            {
                JsonContentString.Set(context, "null");
                JsonContentToken.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"File not found: {filePath}");
                return;
            }

            // Read file content
            var content = File.ReadAllText(filePath);
            var jsonNode = JsonNode.Parse(content);
            JsonContentString.Set(context, content);
            JsonContentToken.Set(context, jsonNode);
            status = $"Successfully read JSON file: {filePath}";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            JsonContentString.Set(context, "null");
            JsonContentToken.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error reading JSON file: {ex.Message}");
        }
    }
}
