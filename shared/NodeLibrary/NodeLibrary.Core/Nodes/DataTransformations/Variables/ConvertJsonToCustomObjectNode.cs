namespace NodeLibrary.VariablesNodes;

[DisplayName("Convert JSON to Custom Object"), Description("Converts a JSON string into a strongly-typed custom object.")]
[NodeMetadata(icon: "/assets/Variables.svg")]
public class ConvertJsonToCustomObjectNode : BaseNode
{
    [DisplayName("JSON Data"), Description("The JSON string that will be converted to a custom object.")]
    public required InArgument<string> JsonData { get; set; }

    [DisplayName("Custom Object"), Description("Returns the resulting custom object after JSON deserialization.")]
    public OutArgument<object> CustomObject { get; set; } = new OutArgument<object>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var jsonData = JsonData.Get(context);

            if (string.IsNullOrWhiteSpace(jsonData))
                throw new ArgumentException("JSON data cannot be empty.");

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                WriteIndented = true
            };

            var result = JsonSerializer.Deserialize<Dictionary<string, object>>(jsonData, options);

            CustomObject.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "JSON successfully converted to object.");
        }
        catch (Exception ex)
        {
            CustomObject.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error converting JSON to object: {ex.Message}");
        }
    }
}
