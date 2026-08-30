namespace NodeLibrary.FolderNodes;

[DisplayName("Retrieve Files in Folder"), Description("Retrieves a list of files from a specified folder with optional filtering, subfolder inclusion, and multi-level sorting.")]
[NodeMetadata(icon: "/assets/Folder.svg")]
public class GetFilesInFolderNode : BaseNode
{
    [DisplayName("Folder path"), Description("The absolute path of the folder to retrieve files from (e.g., 'C:\\Documents\\Reports').")]
    public InArgument<string> FolderPath { get; set; } = new InArgument<string>(string.Empty);

    [DisplayName("File filter"), Description("One or more file patterns separated by semicolons (;). Examples: *.txt;*.pdf;*.docx;invoice_*.xlsx. Default: * (all files).")]
    public InArgument<string> FileFilter { get; set; } = new InArgument<string>("*");

    [DisplayName("Include subfolders"), Description("When true, includes files from all subdirectories recursively. Default: true.")]
    public InArgument<bool> IncludeSubfolders { get; set; } = new InArgument<bool>(true);

    [DisplayName("Fail on access denied"), Description("When true, the activity fails if access to any subfolder is denied. When false, inaccessible folders are skipped. Default: true.")]
    public InArgument<bool> FailUponDeniedAccess { get; set; } = new InArgument<bool>(true);

    [DisplayName("Sort by"), Description("Primary sort criterion for the file list. Default: No sort.")]
    public InArgument<FileSortCriteria> SortBy { get; set; } = new InArgument<FileSortCriteria>(FileSortCriteria.NoSort);

    [DisplayName("Descending order"), Description("When true, sorts files in descending order. Default: false (ascending).")]
    public InArgument<bool> Descending { get; set; } = new InArgument<bool>(false);

    [DisplayName("Then sort by"), Description("Secondary sort criterion applied after the primary sort. Default: No sort.")]
    public InArgument<FileSortCriteria> ThenBy { get; set; } = new InArgument<FileSortCriteria>(FileSortCriteria.NoSort);

    [DisplayName("Retrieved files"), Description("The list of full file paths that matched the filter and sort criteria.")]
    public OutArgument<IEnumerable<string>> RetrievedFiles { get; set; } = new OutArgument<IEnumerable<string>>();

    protected override void Execute(INodeContext context)
    {
        var folderPath = FolderPath.Get(context);
        var fileFilter = FileFilter.Get(context);
        var includeSubfolders = IncludeSubfolders.Get(context);
        var failUponDeniedAccess = FailUponDeniedAccess.Get(context);
        var sortBy = SortBy.Get(context);
        var descending = Descending.Get(context);
        var thenBy = ThenBy.Get(context);

        if (string.IsNullOrWhiteSpace(folderPath))
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, "Folder path cannot be empty.");
            return;
        }

        if (!Directory.Exists(folderPath))
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"The specified folder does not exist: {folderPath}");
            return;
        }

        if (string.IsNullOrWhiteSpace(fileFilter))
            fileFilter = "*";

        try
        {
            var files = GetFiles(folderPath, fileFilter, includeSubfolders, failUponDeniedAccess);

            if (sortBy != FileSortCriteria.NoSort)
                files = SortFiles(files, sortBy, descending, thenBy);

            var result = files.ToList();
            RetrievedFiles.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"{result.Count} file(s) retrieved successfully.");
        }
        catch (UnauthorizedAccessException ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Access denied: {ex.Message}");
        }
        catch (IOException ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"I/O error retrieving files: {ex.Message}");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error retrieving files: {ex.Message}");
        }
    }

    private static IEnumerable<string> GetFiles(string folderPath, string fileFilter, bool includeSubfolders, bool failUponDeniedAccess)
    {
        var searchOption = includeSubfolders ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly;
        var patterns = fileFilter.Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries);

        if (!failUponDeniedAccess && includeSubfolders)
        {
            return patterns
                .SelectMany(pattern => EnumerateFilesSkipDenied(folderPath, pattern.Trim()))
                .Distinct();
        }

        try
        {
            return patterns
                .SelectMany(pattern => Directory.EnumerateFiles(folderPath, pattern.Trim(), searchOption))
                .Distinct()
                .ToList();
        }
        catch (UnauthorizedAccessException ex)
        {
            if (failUponDeniedAccess)
                throw new UnauthorizedAccessException($"Access denied to folder: {folderPath}", ex);
            return Enumerable.Empty<string>();
        }
    }

    private static IEnumerable<string> EnumerateFilesSkipDenied(string folderPath, string pattern)
    {
        IEnumerable<string> topFiles = Enumerable.Empty<string>();
        try { topFiles = Directory.EnumerateFiles(folderPath, pattern, SearchOption.TopDirectoryOnly); }
        catch (UnauthorizedAccessException) { }

        foreach (var file in topFiles)
            yield return file;

        IEnumerable<string> subDirs = Enumerable.Empty<string>();
        try { subDirs = Directory.EnumerateDirectories(folderPath); }
        catch (UnauthorizedAccessException) { }

        foreach (var dir in subDirs)
            foreach (var file in EnumerateFilesSkipDenied(dir, pattern))
                yield return file;
    }

    private static IEnumerable<string> SortFiles(IEnumerable<string> files, FileSortCriteria sortBy, bool descending, FileSortCriteria thenBy)
    {
        var getSortKey = GetSortKeySelector(sortBy);
        if (getSortKey is null)
            return files;

        IOrderedEnumerable<string> orderedFiles = descending
            ? files.OrderByDescending(getSortKey)
            : files.OrderBy(getSortKey);

        if (thenBy != FileSortCriteria.NoSort)
        {
            var getThenKey = GetSortKeySelector(thenBy);
            if (getThenKey is not null)
            {
                orderedFiles = descending
                    ? orderedFiles.ThenByDescending(getThenKey)
                    : orderedFiles.ThenBy(getThenKey);
            }
        }

        return orderedFiles;
    }

    private static Func<string, object>? GetSortKeySelector(FileSortCriteria criteria)
    {
        return criteria switch
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
    }
}

public enum FileSortCriteria
{
    [Display(Name = "No sort", Description = "No sorting applied; files returned in file-system order.")]
    NoSort,

    [Display(Name = "Full path", Description = "Sort by the complete file path.")]
    FullName,

    [Display(Name = "Root path", Description = "Sort by the root directory (e.g., 'C:\\').")]
    RootPath,

    [Display(Name = "Directory", Description = "Sort by the parent directory path.")]
    Directory,

    [Display(Name = "File name", Description = "Sort by the file name including extension.")]
    Name,

    [Display(Name = "Name without extension", Description = "Sort by the file name excluding the extension.")]
    NameWithoutExtension,

    [Display(Name = "Extension", Description = "Sort by the file extension (e.g., '.txt', '.pdf').")]
    Extension,

    [Display(Name = "Size", Description = "Sort by the file size in bytes.")]
    Size
}