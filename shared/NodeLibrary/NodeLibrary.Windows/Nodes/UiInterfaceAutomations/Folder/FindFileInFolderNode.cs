namespace NodeLibrary.FolderNodes;

[DisplayName("Find File in Folder"), Description("Finds a single file in a folder based on criteria such as largest, smallest, newest, or oldest. Optionally searches subfolders.")]
[NodeMetadata(icon: "/assets/Folder.svg")]
public class FindFileInFolderNode : BaseNode
{
    [DisplayName("Folder path"), Description("The absolute path of the folder to search in (e.g., 'C:\\Documents\\Reports').")]
    public required InArgument<string> FolderPath { get; set; }

    [DisplayName("Search criteria"), Description("The criterion used to select the file. Default: Largest.")]
    public required InArgument<FileSearchOption> SearchOption { get; set; } = new InArgument<FileSearchOption>(FileSearchOption.Largest);

    [DisplayName("File filter"), Description("One or more file patterns separated by semicolons (e.g., '*.txt' or '*.jpg;*.png'). Default: '*' (all files).")]
    public InArgument<string> FileFilter { get; set; } = new InArgument<string>("*");

    [DisplayName("Include subfolders"), Description("When true, searches all subfolders recursively. Default: true.")]
    public InArgument<bool> IncludeSubfolders { get; set; } = new InArgument<bool>(true);

    [DisplayName("Result file path"), Description("The full path of the file that matched the search criteria, or empty if no match was found.")]
    public OutArgument<string> ResultFilePath { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var folderPath = FolderPath.Get(context);
        var fileFilter = FileFilter.Get(context);
        var includeSubfolders = IncludeSubfolders.Get(context);
        var searchOption = SearchOption.Get(context);

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
            var searchOpt = includeSubfolders ? System.IO.SearchOption.AllDirectories : System.IO.SearchOption.TopDirectoryOnly;
            var filters = fileFilter.Split(';', StringSplitOptions.RemoveEmptyEntries);

            var files = filters
                .SelectMany(f => Directory.EnumerateFiles(folderPath, f.Trim(), searchOpt))
                .Where(f => (File.GetAttributes(f) & FileAttributes.Hidden) == 0)
                .ToList();

            if (files.Count == 0)
            {
                ResultFilePath.Set(context, null);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "No matching file found.");
                return;
            }

            string result;
            switch (searchOption)
            {
                case FileSearchOption.Largest:
                    result = files.OrderByDescending(f => new FileInfo(f).Length).First();
                    break;
                case FileSearchOption.Smallest:
                    result = files.OrderBy(f => new FileInfo(f).Length).First();
                    break;
                case FileSearchOption.Newest:
                    result = files.OrderByDescending(File.GetLastWriteTime).First();
                    break;
                case FileSearchOption.Oldest:
                    result = files.OrderBy(File.GetLastWriteTime).First();
                    break;
                case FileSearchOption.NewestCreated:
                    result = files.OrderByDescending(File.GetCreationTime).First();
                    break;
                case FileSearchOption.OldestCreated:
                    result = files.OrderBy(File.GetCreationTime).First();
                    break;
                case FileSearchOption.FirstAlphabetical:
                    result = files.OrderBy(Path.GetFileName).First();
                    break;
                case FileSearchOption.LastAlphabetical:
                    result = files.OrderByDescending(Path.GetFileName).First();
                    break;
                default:
                    result = files.First();
                    break;
            }

            ResultFilePath.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "File found successfully.");
        }
        catch (UnauthorizedAccessException ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Access denied: {ex.Message}");
        }
        catch (IOException ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"I/O error searching folder: {ex.Message}");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error finding file: {ex.Message}");
        }
    }
}

public enum FileSearchOption
{
    [Display(Name = "Largest", Description = "Find the largest file by size.")]
    Largest,

    [Display(Name = "Smallest", Description = "Find the smallest file by size.")]
    Smallest,

    [Display(Name = "Newest modified", Description = "Find the most recently modified file.")]
    Newest,

    [Display(Name = "Oldest modified", Description = "Find the least recently modified file.")]
    Oldest,

    [Display(Name = "Newest created", Description = "Find the most recently created file.")]
    NewestCreated,

    [Display(Name = "Oldest created", Description = "Find the earliest created file.")]
    OldestCreated,

    [Display(Name = "First alphabetical", Description = "Find the first file when sorted alphabetically by name.")]
    FirstAlphabetical,

    [Display(Name = "Last alphabetical", Description = "Find the last file when sorted alphabetically by name.")]
    LastAlphabetical
}