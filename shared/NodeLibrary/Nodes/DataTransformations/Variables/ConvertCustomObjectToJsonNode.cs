namespace NodeLibrary.VariablesNodes;

[DisplayName("Convert Custom Object to JSON"), Description("Converts a custom object into its JSON representation.")]
[NodeMetadata(icon: "/assets/Variables.svg")]
public class ConvertCustomObjectToJsonNode : BaseNode
{
    [DisplayName("Custom Object"), Description("The custom object to convert to JSON.")]
    public required InArgument<object> CustomObject { get; set; }

    [DisplayName("Pretty Print"), Description("If true, formats the JSON output with indentation for better readability.")]
    public InArgument<bool> PrettyPrint { get; set; } = new InArgument<bool>(true);

    [DisplayName("JSON Output"), Description("The converted JSON string from the provided custom object.")]
    public OutArgument<string> JsonOutput { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var inputObject = CustomObject.Get(context);
            var prettyPrint = PrettyPrint.Get(context);

            if (inputObject == null)
                throw new ArgumentNullException(nameof(CustomObject), "Custom object cannot be null.");

            var options = new JsonSerializerOptions();

            if (prettyPrint) options.WriteIndented = true;

            var jsonResult = JsonSerializer.Serialize(inputObject, options);

            JsonOutput.Set(context, jsonResult);
            status = "Custom object successfully converted to JSON.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            JsonOutput.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error converting custom object to JSON: {ex.Message}");
        }
    }
}
