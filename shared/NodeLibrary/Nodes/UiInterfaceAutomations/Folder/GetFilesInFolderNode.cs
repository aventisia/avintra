namespace NodeLibrary.FolderNodes;

[DisplayName("Retrieve Files in Folder"), Description("This activity retrieves the list of files in a specified folder, with options to include subfolders and sort the results.")]
[NodeMetadata(icon: "/assets/Folder.svg")]
public class GetFilesInFolderNode : BaseNode
{
    [DisplayName("Folder Path"), Description("Specifies the path to the folder where files will be retrieved.")]
    public InArgument<string> FolderPath { get; set; } = new InArgument<string>(string.Empty);

    [DisplayName("File Filter"), Description("A pattern to filter the files (e.g., \"*.txt\" for text files).")]
    public InArgument<string> FileFilter { get; set; } = new InArgument<string>("*");

    [DisplayName("Include Subfolders"), Description("If true, includes files from all subfolders within the specified folder.")]
    public InArgument<bool> IncludeSubfolders { get; set; } = new InArgument<bool>(true);

    [DisplayName("Fail on Denied Access"), Description("If true, the activity will fail if access to any subfolder is denied.")]
    public InArgument<bool> FailUponDeniedAccess { get; set; } = new InArgument<bool>(true);

    [DisplayName("Sort By"), Description("The primary criterion to sort the retrieved files (e.g., \"Name\", \"LastWriteTime\").")]
    public InArgument<FileSortCriteria> SortBy { get; set; } = new InArgument<FileSortCriteria>(FileSortCriteria.NoSort);

    [DisplayName("Descending Order"), Description("If true, sorts the files in descending order based on the primary sort criterion.")]
    public InArgument<bool> Descending { get; set; } = new InArgument<bool>(false);

    [DisplayName("Then By"), Description("The secondary criterion to sort the retrieved files (e.g., \"Size\", \"CreationTime\").")]
    public InArgument<FileSortCriteria> ThenBy { get; set; } = new InArgument<FileSortCriteria>(FileSortCriteria.NoSort);

    [DisplayName("Retrieved Files"), Description("The list of files that were retrieved based on the specified criteria.")]
    public OutArgument<IEnumerable<string>> RetrievedFiles { get; set; } = new OutArgument<IEnumerable<string>>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var folderPath = FolderPath.Get(context);
            var fileFilter = FileFilter.Get(context);
            var includeSubfolders = IncludeSubfolders.Get(context);
            var failUponDeniedAccess = FailUponDeniedAccess.Get(context);
            var sortBy = SortBy.Get(context);
            var descending = Descending.Get(context);
            var thenBy = ThenBy.Get(context);

            if (!Directory.Exists(folderPath))
                throw new DirectoryNotFoundException($"The specified folder path does not exist: {folderPath}");

            var files = GetFiles(folderPath, fileFilter, includeSubfolders, failUponDeniedAccess);

            if (sortBy != FileSortCriteria.NoSort)
                files = SortFiles(files, sortBy, descending, thenBy);

            RetrievedFiles.Set(context, files);
            status = "Files retrieved successfully.";

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error retrieving files: {ex.Message}");
        }
    }

    private static IEnumerable<string> GetFiles(string folderPath, string fileFilter, bool includeSubfolders, bool failUponDeniedAccess)
    {
        try
        {
            var searchOption = includeSubfolders ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly;
            return Directory.GetFiles(folderPath, fileFilter, searchOption);
        }
        catch (UnauthorizedAccessException ex)
        {
            if (failUponDeniedAccess)
                throw new UnauthorizedAccessException($"Access denied to folder: {folderPath}", ex);

            return [];
        }
    }

    private static IEnumerable<string> SortFiles(IEnumerable<string> files, FileSortCriteria sortBy, bool descending, FileSortCriteria thenBy)
    {
        Func<string, object>? getSortKey = sortBy switch
        {
            FileSortCriteria.FullName => f => f,
            FileSortCriteria.RootPath => Path.GetPathRoot,
            FileSortCriteria.Directory => Path.GetDirectoryName,
            FileSortCriteria.Name => Path.GetFileName,
            FileSortCriteria.NameWithoutExtension => Path.GetFileNameWithoutExtension,
            FileSortCriteria.Extension => Path.GetExtension,
            FileSortCriteria.Size => f => new FileInfo(f).Length,
            _ => null
        };

        if (getSortKey is null)
            return files;

        Func<string, object>? getThenKey = thenBy switch
        {
            FileSortCriteria.FullName => f => f,
            FileSortCriteria.RootPath => Path.GetPathRoot,
            FileSortCriteria.Directory => Path.GetDirectoryName,
            FileSortCriteria.Name => Path.GetFileName,
            FileSortCriteria.NameWithoutExtension => Path.GetFileNameWithoutExtension,
            FileSortCriteria.Extension => Path.GetExtension,
            FileSortCriteria.Size => f => new FileInfo(f).Length,
            _ => null
        };

        IOrderedEnumerable<string> orderedFiles = descending
            ? files.OrderByDescending(getSortKey)
            : files.OrderBy(getSortKey);

        if (thenBy != FileSortCriteria.NoSort && getThenKey is not null)
        {
            orderedFiles = descending
                ? orderedFiles.ThenByDescending(getThenKey)
                : orderedFiles.ThenBy(getThenKey);
        }

        return [.. orderedFiles];
    }
}

public enum FileSortCriteria
{
    [Display(Name = "NoSort", Description = "No sorting applied.")]
    NoSort,

    [Display(Name = "FullName", Description = "Sort by the full file path.")]
    FullName,

    [Display(Name = "RootPath", Description = "Sort by the root directory path.")]
    RootPath,

    [Display(Name = "Directory", Description = "Sort by the directory containing the file.")]
    Directory,

    [Display(Name = "Name", Description = "Sort by the file name.")]
    Name,

    [Display(Name = "NameWithoutExtension", Description = "Sort by the file name without the extension.")]
    NameWithoutExtension,

    [Display(Name = "Extension", Description = "Sort by the file extension.")]
    Extension,

    [Display(Name = "Size", Description = "Sort by the file size.")]
    Size
}