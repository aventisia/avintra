namespace NodeLibrary.JsonNodes;

[DisplayName("Write Text to JSON File"), Description("Writes the provided content as JSON to the specified file path.")]
[NodeMetadata(icon: "/assets/JSON.svg")]
public class WriteTextToJSONFileNode : BaseNode
{
    [DisplayName("JSON Content"), Description("The content to write as JSON. Can be a string, object, array, JsonObject, JsonArray, List, Dictionary, etc.")]
    public required InArgument<object> JsonContent { get; set; }

    [DisplayName("File Path"), Description("The full path to the file where the JSON content will be written.")]
    public required InArgument<string> FilePath { get; set; }

    protected override void Execute(INodeContext context)
    {
        var status = "";

        try
        {
            var input = JsonContent.Get(context);
            var filePath = FilePath.Get(context);

            if (string.IsNullOrWhiteSpace(filePath))
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, "File path is null or empty.");
                return;
            }

            if (input == null)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, "JSON content is null.");
                return;
            }

            var options = new JsonSerializerOptions { WriteIndented = true };
            var jsonContent = input switch
            {
                string str => ConvertStringToJson(str, options),
                JsonNode jsonNode => jsonNode.ToJsonString(options),
                IEnumerable enumerable when !(input is string) => JsonSerializer.Serialize(enumerable, options),
                ValueType valuetype => JsonSerializer.Serialize(valuetype, options),
                _ => JsonSerializer.Serialize(input, options)
            };

            // Ensure directory exists
            var directory = Path.GetDirectoryName(filePath);
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            File.WriteAllText(filePath, jsonContent);

            status = $"Successfully wrote JSON to file: {filePath}";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error writing JSON file: {ex.Message}");
        }
    }

    private static string ConvertStringToJson(string str, JsonSerializerOptions options)
    {
        try
        {
            JsonNode.Parse(str);
            return str;
        }
        catch
        {
            return JsonSerializer.Serialize(str, options);
        }
    }
}
