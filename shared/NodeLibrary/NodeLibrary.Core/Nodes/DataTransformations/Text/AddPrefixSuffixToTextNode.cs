namespace NodeLibrary.TextNodes;

[DisplayName("Add Prefix or Suffix to Text"), Description("Adds a prefix and/or suffix to a text value.")]
[NodeMetadata(icon: "/assets/Text.svg", badge: "Beta")]
public class AddPrefixSuffixToTextNode : BaseNode
{
    [DisplayName("Text"), Description("The original text.")]
    public InArgument<string> Text { get; set; } = new InArgument<string>();

    [DisplayName("Prefix"), Description("The text to prepend to the original text.")]
    public InArgument<string> Prefix { get; set; } = new InArgument<string>();

    [DisplayName("Suffix"), Description("The text to append to the original text.")]
    public InArgument<string> Suffix { get; set; } = new InArgument<string>();

    [DisplayName("Result"), Description("The resulting text with the prefix and/or suffix applied.")]
    public OutArgument<string> Result { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var text = Text.Get(context) ?? "";
            var prefix = Prefix.Get(context);
            var suffix = Suffix.Get(context);

            Result.Set(context, (prefix ?? "") + text + (suffix ?? ""));
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            Result.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error adding prefix/suffix: {ex.Message}");
        }
    }
}
