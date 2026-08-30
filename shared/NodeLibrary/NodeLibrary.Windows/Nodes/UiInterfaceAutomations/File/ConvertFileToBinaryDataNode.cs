namespace NodeLibrary.FileNodes;

[DisplayName("Convert File to Binary Data"), Description("Converts a file to binary data.")]
[NodeMetadata(icon: "/assets/File.svg")]
public class ConvertFileToBinaryDataNode : BaseNode
{
    [DisplayName("File Path"), Description("The full path of the file to convert.")]
    public required InArgument<string> FilePath { get; set; }

    [DisplayName("Binary Data"), Description("Returns the binary data of the file.")]
    public OutArgument<byte[]> BinaryData { get; set; } = new OutArgument<byte[]>();


    protected override void Execute(INodeContext context)
    {
        var filePath = FilePath.Get(context);
        byte[]? binaryData = null;

        try
        {
            if (!File.Exists(filePath))
                throw new ArgumentException($"File not found: {filePath}");

            binaryData = File.ReadAllBytes(filePath);
            BinaryData.Set(context, binaryData);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "File converted to binary data successfully.");
        }
        catch (Exception ex)
        {
            BinaryData.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error converting file to binary data: {ex.Message}");
        }
    }
}
