using NodeLibrary.FileNodes.Enums;
using NodeLibrary.TextNodes.Enums;
using NodeLibrary.TextNodes.Helpers;

namespace NodeLibrary.FileNodes;

[DisplayName("Convert Base64 to File"), Description("Converts a Base64 encoded string to a file and saves it at the specified path.")]
[NodeMetadata(icon: "/assets/File.svg")]
public class ConvertBase64ToFileNode : BaseNode
{
    [DisplayName("Base64 Encoded Text"), Description("The Base64 encoded string to be converted into a file.")]
    public required InArgument<string> Base64Text { get; set; }

    [DisplayName("File Path"), Description("The destination file path where the decoded content will be saved.")]
    public required InArgument<string> FilePath { get; set; }

    [DisplayName("If File Exists"), Description("Specifies the behavior when a file already exists in the destination folder.")]
    public required InArgument<IfExistsActionEnum> IfExistsAction { get; set; } = new InArgument<IfExistsActionEnum>(IfExistsActionEnum.DoNothing);

    [DisplayName("Base64 Variant"), Description("The Base64 alphabet to accept: Standard, URL-safe, or Auto (both). Defaults to Auto so URL-safe file payloads decode.")]
    public InArgument<Base64VariantEnum> Base64Variant { get; set; } = new InArgument<Base64VariantEnum>(Base64VariantEnum.Auto);



    protected override void Execute(INodeContext context)
    {
        var base64 = Base64Text.Get(context);
        var filePath = FilePath.Get(context);
        var ifExists = IfExistsAction.Get(context);
        var status = "Operation completed successfully.";
        var shouldWrite = true;

        try
        {
            if (string.IsNullOrWhiteSpace(base64))
                throw new ArgumentException("Base64 encoded text cannot be null or empty.");

            var fileBytes = Base64Helper.Decode(base64, Base64Variant.Get(context));
            var dir = Path.GetDirectoryName(filePath);

            if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
                Directory.CreateDirectory(dir);

            if (File.Exists(filePath))
                switch (ifExists)
                {
                    case IfExistsActionEnum.DoNothing:
                        status = $"File already exists at {filePath}. No action was taken.";
                        shouldWrite = false;
                        break;
                    case IfExistsActionEnum.Overwrite:
                        // continue to overwrite below
                        break;
                }

            if (shouldWrite)
            {
                File.WriteAllBytes(filePath ?? string.Empty, fileBytes);
                status = $"File successfully created at {filePath}.";
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (FormatException ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Invalid Base64 format: {ex.Message}");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error saving file: {ex.Message}");
        }
    }
}
