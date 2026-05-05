namespace NodeLibrary.FileNodes;

[DisplayName("Get Temporary File"), Description("Creates a uniquely named empty temporary file on disk and returns its FileInfo object.")]
[NodeMetadata(icon: "/assets/File.svg")]
public class GetTemporaryFileNode : BaseNode
{
    [DisplayName("Temporary File"), Description("The FileInfo object representing the temporary file created on disk.")]
    public OutArgument<FileInfo> TempFile { get; set; } = new OutArgument<FileInfo>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            // Generate a unique temporary file path
            var tempFilePath = Path.GetTempFileName();

            // Create the FileInfo object to represent the file
            var fileInfo = new FileInfo(tempFilePath);

            // Set the output
            TempFile.Set(context, fileInfo);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Temporary file created successfully.");
        }
        catch (Exception ex)
        {
            TempFile.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error creating temporary file: {ex.Message}");
        }
    }
}
