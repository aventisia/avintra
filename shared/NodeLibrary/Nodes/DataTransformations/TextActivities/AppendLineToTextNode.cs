namespace NodeLibrary.DataTransformations.TextActivities;

[DisplayName("Append Line to Text"), Description("Appends a new line of text to the original text.")]
[NodeMetadata(icon: "/assets/Text.svg")]
public class AppendLineToTextNode : BaseNode
{
    [Description("The original text to which a new line will be appended.")]
    public InArgument<string> OriginalText { get; set; }

    [Description("The new line of text to append.")]
    public InArgument<string> NewLine { get; set; }

    [Description("The resulting text after appending the new line.")]
    public OutArgument<string> ResultOutput { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var original = OriginalText.Get(context);
            var newline = NewLine.Get(context);

            var result = string.IsNullOrEmpty(original)
                ? newline
                : $"{original}{Environment.NewLine}{newline}";

            ResultOutput.Set(context, result);

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Line appended successfully.");
        }
        catch (Exception ex)
        {
            ResultOutput.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error appending line to text: {ex.Message}");
        }
    }
}
