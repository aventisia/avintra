namespace NodeLibrary.FileNodes;

[DisplayName("Convert Base64 to Text"), Description("Converts a Base64-encoded string to plain text.")]
[NodeMetadata(icon: "/assets/File.svg")]
public class ConvertBase64ToTextNode : BaseNode
{
    [DisplayName("Base64 String"), Description("The Base64-encoded string to convert.")]
    public required InArgument<string> Base64String { get; set; }

    [DisplayName("Plain Text"), Description("Returns the converted plain text.")]
    public OutArgument<string> PlainText { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var base64 = Base64String.Get(context);
        var result = string.Empty;
        string status;

        try
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(base64))
                throw new ArgumentException("Base64 string cannot be null or empty.", nameof(Base64String));

            // Clean up Base64 string
            base64 = Regex.Replace(base64, @"\s+", ""); // Remove all whitespace

            // Ensure proper padding
            var mod4 = base64.Length % 4;
            if (mod4 != 0)
            {
                base64 = base64.PadRight(base64.Length + (4 - mod4), '=');
            }

            // Decode Base64
            var data = Convert.FromBase64String(base64);
            result = Encoding.UTF8.GetString(data).Trim(); // Trim optional

            status = "Base64 string successfully converted to plain text.";
            PlainText.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (FormatException fex)
        {
            status = $"Invalid Base64 format. Make sure the input is a valid Base64 string. Error: {fex.Message}";
            PlainText.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error converting Base64 to text: {ex.Message}";
            PlainText.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
    }
}
