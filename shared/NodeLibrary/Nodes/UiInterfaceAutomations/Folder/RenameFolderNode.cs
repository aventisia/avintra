namespace NodeLibrary.FolderNodes;

[DisplayName("Rename Folder"), Description("This activity renames an existing folder by specifying the original folder path and the new folder name.")]
[NodeMetadata(icon: "/assets/Folder.svg")]
public class RenameFolderNode : BaseNode
{
    [DisplayName("Original Folder Path"), Description("Specifies the path of the folder that needs to be renamed.")]
    public InArgument<string> OriginalFolderPath { get; set; } = new InArgument<string>(string.Empty);

    [DisplayName("New Folder Name"), Description("Specifies the new name for the folder.")]
    public InArgument<string> NewFolderName { get; set; } = new InArgument<string>(string.Empty);

    [DisplayName("Renamed Folder Path"), Description("The path of the folder after it has been successfully renamed.")]
    public OutArgument<string> RenamedFolderPath { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var originalFolderPath = OriginalFolderPath.Get(context);
            var newFolderName = NewFolderName.Get(context);

            if (string.IsNullOrWhiteSpace(originalFolderPath))
                throw new ArgumentException("The 'Original Folder Path' cannot be null or empty.");

            if (string.IsNullOrWhiteSpace(newFolderName))
                throw new ArgumentException("The 'New Folder Name' cannot be null or empty.");

            if (!Directory.Exists(originalFolderPath))
                throw new DirectoryNotFoundException($"The specified folder does not exist: {originalFolderPath}");

            var parentDirectory = Path.GetDirectoryName(originalFolderPath);
            var newFolderPath = Path.Combine(parentDirectory!, newFolderName);

            Directory.Move(originalFolderPath, newFolderPath);

            RenamedFolderPath.Set(context, newFolderPath);
            status = $"Folder renamed successfully to: {newFolderPath}";

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Failed to rename the folder: {ex.Message}");
        }
    }
}