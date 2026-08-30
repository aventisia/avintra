namespace NodeLibrary.FolderNodes;

[DisplayName("Retrieve Subfolders from Directory"), Description("Returns a list of subfolder paths within the specified directory.")]
[NodeMetadata(icon: "/assets/Folder.svg")]
public class GetSubfoldersInFolderNode : BaseNode
{
    [DisplayName("Source Folder Path"), Description("The full path of the directory from which subfolders will be retrieved.")]
    public required InArgument<string> FolderPath { get; set; }

    [DisplayName("Include Nested Subfolders"), Description("Determines whether to include all nested subdirectories recursively.")]
    public InArgument<bool> IncludeSubfolders { get; set; } = new InArgument<bool>(false);

    [DisplayName("Subfolder List"), Description("The collection of subfolder paths found in the specified directory.")]
    public OutArgument<IEnumerable<string>> Subfolders { get; set; } = new OutArgument<IEnumerable<string>>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var folderPath = FolderPath.Get(context);
            var includeSubfolders = IncludeSubfolders.Get(context);

            if (string.IsNullOrWhiteSpace(folderPath))
                throw new ArgumentException("Folder path must not be null or empty.", nameof(FolderPath));

            if (!Directory.Exists(folderPath))
                throw new DirectoryNotFoundException($"The specified folder does not exist: {folderPath}");

            var searchOption = includeSubfolders ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly;
            var subfolders = Directory.GetDirectories(folderPath, "*", searchOption);

            Subfolders.Set(context, subfolders);
            status = "Subfolders retrieved successfully.";

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error retrieving subfolders: {ex.Message}");
        }
    }
}