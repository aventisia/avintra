using NodeLibrary.TextNodes.Enums;
using NodeLibrary.TextNodes.Helpers;

namespace NodeLibrary.TextNodes;

[DisplayName("Convert Text to Base64"), Description("Encodes a plain text string into a Base64 string using the specified text encoding.")]
[NodeMetadata(icon: "/assets/Text.svg")]
public class ConvertTextToBase64Node : BaseNode
{
    [DisplayName("Text"), Description("The plain text to encode as Base64.")]
    public required InArgument<string> Text { get; set; }

    [DisplayName("Encoding"), Description("The character encoding used to convert the text to bytes before Base64 encoding.")]
    public InArgument<TextEncodingEnum> TextEncoding { get; set; } = new InArgument<TextEncodingEnum>(TextEncodingEnum.Utf8);

    [DisplayName("Base64 Variant"), Description("The Base64 alphabet to emit: Standard, URL-safe, or Auto (behaves as Standard). URL-safe uses '-' and '_' with no '=' padding.")]
    public InArgument<Base64VariantEnum> Base64Variant { get; set; } = new InArgument<Base64VariantEnum>(Base64VariantEnum.Standard);

    [DisplayName("Base64 String"), Description("The resulting Base64-encoded string.")]
    public OutArgument<string> Base64String { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var text = Text.Get(context);
            var textEncoding = TextEncoding.Get(context);

            if (string.IsNullOrEmpty(text))
                throw new ArgumentException("Text cannot be null or empty.", nameof(Text));

            var bytes = TextEncodingHelper.ToEncoding(textEncoding).GetBytes(text);
            Base64String.Set(context, Base64Helper.Encode(bytes, Base64Variant.Get(context)));
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Text converted to Base64 successfully.");
        }
        catch (Exception ex)
        {
            Base64String.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error converting text to Base64: {ex.Message}");
        }
    }
}
