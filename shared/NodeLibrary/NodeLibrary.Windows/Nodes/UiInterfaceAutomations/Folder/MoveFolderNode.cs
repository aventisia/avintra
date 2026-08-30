namespace NodeLibrary.FolderNodes;

[DisplayName("Move Folder"), Description("This activity moves an existing folder to a specified destination folder.")]
[NodeMetadata(icon: "/assets/Folder.svg")]
public class MoveFolderNode : BaseNode
{
    [DisplayName("Folder to Move"), Description("Specifies the path of the folder that needs to be moved.")]
    public InArgument<string> SourceFolderPath { get; set; } = new InArgument<string>(string.Empty);

    [DisplayName("Destination Folder"), Description("Specifies the path of the destination folder where the source folder will be moved.")]
    public InArgument<string> DestinationFolderPath { get; set; } = new InArgument<string>(string.Empty);

    [DisplayName("Moved Folder Path"), Description("The path of the folder after it has been successfully moved.")]
    public OutArgument<string> MovedFolderPath { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var sourceFolderPath = SourceFolderPath.Get(context);
            var destinationFolderPath = DestinationFolderPath.Get(context);

            if (string.IsNullOrWhiteSpace(sourceFolderPath))
                throw new ArgumentException("The 'Folder to Move' cannot be null or empty.");

            if (string.IsNullOrWhiteSpace(destinationFolderPath))
                throw new ArgumentException("The 'Destination Folder' cannot be null or empty.");

            if (!Directory.Exists(sourceFolderPath))
                throw new DirectoryNotFoundException($"The specified folder does not exist: {sourceFolderPath}");

            var destinationFullPath = Path.Combine(destinationFolderPath, Path.GetFileName(sourceFolderPath));
            Directory.Move(sourceFolderPath, destinationFullPath);

            MovedFolderPath.Set(context, destinationFullPath);
            status = $"Folder moved successfully to: {destinationFullPath}";

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Failed to move the folder: {ex.Message}");
        }
    }
}