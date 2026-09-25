using NodeLibrary.TextNodes.Enums;
using NodeLibrary.TextNodes.Helpers;

namespace NodeLibrary.TextNodes;

[DisplayName("Convert Base64 to Text"), Description("Converts a Base64-encoded string to plain text using the specified text encoding.")]
[NodeMetadata(icon: "/assets/Text.svg")]
public class ConvertBase64ToTextNode : BaseNode
{
    [DisplayName("Base64 String"), Description("The Base64-encoded string to convert.")]
    public required InArgument<string> Base64String { get; set; }

    [DisplayName("Encoding"), Description("The character encoding used to decode the Base64 bytes into text.")]
    public InArgument<TextEncodingEnum> TextEncoding { get; set; } = new InArgument<TextEncodingEnum>(TextEncodingEnum.Utf8);

    [DisplayName("Plain Text"), Description("Returns the converted plain text.")]
    public OutArgument<string> PlainText { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var base64 = Base64String.Get(context);

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

            // Decode Base64 using the selected text encoding
            var data = Convert.FromBase64String(base64);
            var result = TextEncodingHelper.ToEncoding(TextEncoding.Get(context)).GetString(data).Trim();

            PlainText.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Base64 string successfully converted to plain text.");
        }
        catch (FormatException fex)
        {
            PlainText.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Invalid Base64 format. Make sure the input is a valid Base64 string. Error: {fex.Message}");
        }
        catch (Exception ex)
        {
            PlainText.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error converting Base64 to text: {ex.Message}");
        }
    }
}
