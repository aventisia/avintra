namespace NodeLibrary.FolderNodes;

[DisplayName("Create Folder"), Description("Generates a new folder within the specified parent directory using a given folder name.")]
[NodeMetadata(icon: "/assets/Folder.svg")]
public class CreateFolderNode : BaseNode
{
    [DisplayName("Create New Folder Into"), Description("The full path of the parent directory where the new folder should be created.")]
    public required InArgument<string> ParentDirectory { get; set; }

    [DisplayName("New Folder Name"), Description("The name of the folder to be created inside the specified parent directory.")]
    public required InArgument<string> FolderName { get; set; }

    [DisplayName("New Folder"), Description("The full path of the newly created folder, which can be used for further actions.")]
    public OutArgument<string> NewFolder { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var parentPath = ParentDirectory.Get(context);
            var newFolderName = FolderName.Get(context);

            if (string.IsNullOrWhiteSpace(parentPath))
                throw new ArgumentException("Parent directory path cannot be null or empty.");

            if (string.IsNullOrWhiteSpace(newFolderName))
                throw new ArgumentException("New folder name cannot be null or empty.");

            var fullPath = Path.Combine(parentPath, newFolderName);

            if (!Directory.Exists(fullPath))
                Directory.CreateDirectory(fullPath);

            NewFolder.Set(context, fullPath);
            status = "Folder created successfully.";

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error creating folder: {ex.Message}");
        }
    }
}