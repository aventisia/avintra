namespace NodeLibrary.FolderNodes;

[DisplayName("Empty Folder"), Description("Removes all files and subdirectories within the specified folder, preserving the folder itself.")]
[NodeMetadata(icon: "/assets/Folder.svg")]
public class EmptyFolderNode : BaseNode
{
    [DisplayName("Folder to Empty"), Description("Specify the path of the folder whose contents should be deleted.")]
    public required InArgument<string> FolderPath { get; set; }

    [DisplayName("Include Subfolders"), Description("Determines whether subfolders and their contents should also be deleted.")]
    public InArgument<bool> DeleteSubfolders { get; set; } = new InArgument<bool>(true);

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var folderPath = FolderPath.Get(context);
            var deleteSubfolders = DeleteSubfolders.Get(context);

            if (string.IsNullOrWhiteSpace(folderPath))
                throw new ArgumentException("Folder path cannot be null or empty.", nameof(folderPath));

            if (!Directory.Exists(folderPath))
                throw new DirectoryNotFoundException($"The specified folder does not exist: {folderPath}");

            foreach (var file in Directory.GetFiles(folderPath))
                File.Delete(file);

            if (deleteSubfolders)
            {
                foreach (var dir in Directory.GetDirectories(folderPath))
                    Directory.Delete(dir, true);
            }

            status = "Folder contents deleted successfully.";

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error deleting folder contents: {ex.Message}");
        }
    }
}