namespace NodeLibrary.FileNodes;

[DisplayName("Convert Binary Data to File"), Description("Converts binary data (byte[] or Base64 string) to a file at the specified path.")]
[NodeMetadata(icon: "/assets/File.svg")]
public class ConvertBinaryDataToFileNode : BaseNode
{
    [DisplayName("Binary Data"), Description("The binary data to convert. Can be either byte[] or Base64 string.")]
    public required InArgument<object> BinaryData { get; set; }

    [DisplayName("File Path"), Description("The full path where the file should be saved.")]
    public required InArgument<string> FilePath { get; set; }

    [DisplayName("If File Exists"), Description("Specifies the behavior when a file already exists in the destination folder.")]
    public required InArgument<Enums.IfExistsActionEnum> IfExistsAction { get; set; } = new InArgument<Enums.IfExistsActionEnum>(Enums.IfExistsActionEnum.DoNothing);

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            // Get inputs
            var binaryDataObj = BinaryData.Get(context);
            var filePath = FilePath.Get(context);
            var ifExistsAction = IfExistsAction.Get(context);

            // Validate inputs
            if (binaryDataObj == null)
                throw new ArgumentException("Binary data cannot be null.", nameof(BinaryData));

            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("File path cannot be null, empty, or whitespace.", nameof(FilePath));

            // Convert input to byte[]
            byte[] binaryData;

            switch (binaryDataObj)
            {
                case byte[] bytes:
                    binaryData = bytes;
                    break;
                case string base64String:
                    try
                    {
                        binaryData = Convert.FromBase64String(base64String);
                    }
                    catch (FormatException ex)
                    {
                        throw new ArgumentException("Invalid Base64 string provided.", nameof(BinaryData), ex);
                    }

                    break;
                default:
                    throw new ArgumentException("Unsupported binary data type. Must be byte[] or Base64 string.",
                        nameof(BinaryData));
            }

            // Ensure directory exists
            var directory = Path.GetDirectoryName(filePath);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            // Handle existing file
            if (File.Exists(filePath))
            {
                switch (ifExistsAction)
                {
                    case Enums.IfExistsActionEnum.DoNothing:
                        status = $"File already exists at '{filePath}'. No action was taken.";
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, status);
                        return;

                    case Enums.IfExistsActionEnum.Overwrite:
                        File.Delete(filePath);
                        break;

                    default:
                        throw new InvalidOperationException(
                            $"Unsupported 'IfExistsAction' value: {ifExistsAction}");
                }
            }

            // Write binary data to file
            File.WriteAllBytes(filePath, binaryData);
            status = $"Binary data successfully saved to file at '{filePath}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error converting binary data to file: {ex.Message}";
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
    }
}
