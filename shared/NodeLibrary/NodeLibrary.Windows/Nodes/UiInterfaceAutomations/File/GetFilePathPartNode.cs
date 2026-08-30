namespace NodeLibrary.FileNodes;

[DisplayName("Get File Path Components"), Description("Extracts various parts (directory, name, extension) from the given file path.")]
[NodeMetadata(icon: "/assets/File.svg")]
public class GetFilePathPartsNode : BaseNode
{
    [DisplayName("Source File Path"), Description("The full path of the file from which to extract components.")]
    public required InArgument<string> FilePath { get; set; }


    [DisplayName("Root Path"), Description("The root path of the source file.")]
    public OutArgument<string> RootPath { get; set; } = new OutArgument<string>();


    [DisplayName("Directory Path"), Description("The directory of the source file.")]
    public OutArgument<string> Directory { get; set; } = new OutArgument<string>();


    [DisplayName("File Name"), Description("The name of the source file.")]
    public OutArgument<string> FileName { get; set; } = new OutArgument<string>();


    [DisplayName("File Name Without Extension"), Description("The file name (without the extension) of the source file.")]
    public OutArgument<string> FileNameNoExtension { get; set; } = new OutArgument<string>();


    [DisplayName("File Extension"), Description("The extension (for example, .doc) of the source file.")]
    public OutArgument<string> FileExtension { get; set; } = new OutArgument<string>();

    [DisplayName("Creation Date Time"), Description("The creation date and time of the source file.")]
    public OutArgument<DateTime> CreationDateTime { get; set; } = new OutArgument<DateTime>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var filePath = FilePath.Get(context);

            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("FilePath cannot be null or empty.");

            RootPath.Set(context, Path.GetPathRoot(filePath));
            Directory.Set(context, Path.GetDirectoryName(filePath));
            FileName.Set(context, Path.GetFileName(filePath));
            FileNameNoExtension.Set(context, Path.GetFileNameWithoutExtension(filePath));
            FileExtension.Set(context, Path.GetExtension(filePath));
            CreationDateTime.Set(context, File.GetCreationTime(filePath));

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "File path components extracted successfully.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error extracting file path components: {ex.Message}");
        }
    }
}
