namespace NodeLibrary.FolderNodes;

[DisplayName("Delete Folder"), Description("Removes the specified folder and its contents from the file system.")]
[NodeMetadata(icon: "/assets/Folder.svg")]
public class DeleteFolderNode : BaseNode
{
    [DisplayName("Folder to Delete"), Description("Full path of the folder that you want to delete.")]
    public required InArgument<string> FolderPath { get; set; }

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var folderPath = FolderPath.Get(context);

            if (string.IsNullOrWhiteSpace(folderPath))
                throw new ArgumentException("The folder path cannot be null or empty.");

            if (!Directory.Exists(folderPath))
                throw new DirectoryNotFoundException($"The folder '{folderPath}' does not exist.");

            Directory.Delete(folderPath, true);
            status = "Folder deleted successfully.";

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error deleting folder: {ex.Message}");
        }
    }
}