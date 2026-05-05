namespace NodeLibrary.FolderNodes;

[DisplayName("Find File in Folder"), Description("Finds a single file in a folder (and optionally subfolders) based on criteria like largest, smallest, newest, oldest, etc.")]
[NodeMetadata(icon: "/assets/Folder.svg")]
public class FindFileInFolderNode : BaseNode
{
    [DisplayName("Folder Path"), Description("The path to the folder to search in.")]
    public required InArgument<string> FolderPath { get; set; }

    [DisplayName("Search Option"), Description("Criteria to select the file: Largest, Smallest, Newest, Oldest, etc.")]
    public required InArgument<FileSearchOption> SearchOption { get; set; } = new InArgument<FileSearchOption>(FileSearchOption.Largest);

    [DisplayName("File Filter"), Description("File filter(s), e.g. '*.txt' or '*.jpg;*.png'.")]
    public InArgument<string> FileFilter { get; set; } = new InArgument<string>("*");

    [DisplayName("Include Subfolders"), Description("If true, includes files from all subfolders.")]
    public InArgument<bool> IncludeSubfolders { get; set; } = new InArgument<bool>(true);

    [DisplayName("Result File Path"), Description("The file path of the found file.")]
    public OutArgument<string> ResultFilePath { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var folderPath = FolderPath.Get(context);
            var fileFilter = FileFilter.Get(context);
            var includeSubfolders = IncludeSubfolders.Get(context);
            var searchOption = SearchOption.Get(context);

            if (string.IsNullOrWhiteSpace(fileFilter))
                fileFilter = "*";

            if (string.IsNullOrWhiteSpace(folderPath) || !Directory.Exists(folderPath))
                throw new DirectoryNotFoundException($"The specified folder path does not exist: {folderPath}");

            var filters = fileFilter.Split(';', StringSplitOptions.RemoveEmptyEntries);
            var searchOpt = includeSubfolders ? System.IO.SearchOption.AllDirectories : System.IO.SearchOption.TopDirectoryOnly;
            var files = filters.SelectMany(f => Directory.GetFiles(folderPath, f.Trim(), searchOpt))
                .Where(f => (File.GetAttributes(f) & FileAttributes.Hidden) == 0)
                .ToList();

            string? result;
            if (!files.Any())
            {
                result = null;
                status = "No matching file found.";
            }
            else
            {
                result = searchOption switch
                {
                    FileSearchOption.Largest => files.OrderByDescending(f => new FileInfo(f).Length).FirstOrDefault(),
                    FileSearchOption.Smallest => files.OrderBy(f => new FileInfo(f).Length).FirstOrDefault(),
                    FileSearchOption.Newest => files.OrderByDescending(File.GetLastWriteTime).FirstOrDefault(),
                    FileSearchOption.Oldest => files.OrderBy(File.GetLastWriteTime).FirstOrDefault(),
                    FileSearchOption.NewestCreated => files.OrderByDescending(File.GetCreationTime).FirstOrDefault(),
                    FileSearchOption.OldestCreated => files.OrderBy(File.GetCreationTime).FirstOrDefault(),
                    FileSearchOption.FirstAlphabetical => files.OrderBy(Path.GetFileName).FirstOrDefault(),
                    FileSearchOption.LastAlphabetical => files.OrderByDescending(Path.GetFileName).FirstOrDefault(),
                    _ => files.FirstOrDefault()
                };

                status = "File found successfully.";
            }

            ResultFilePath.Set(context, result);

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
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
    [Display(Name = "Largest", Description = "Find the largest file.")]
    Largest,

    [Display(Name = "Smallest", Description = "Find the smallest file.")]
    Smallest,

    [Display(Name = "Newest Modifed", Description = "Find the newest (last modified) file.")]
    Newest,

    [Display(Name = "Oldest Modifed", Description = "Find the oldest (last modified) file.")]
    Oldest,

    [Display(Name = "Newest Created", Description = "Find the newest (created) file.")]
    NewestCreated,

    [Display(Name = "Oldest Created", Description = "Find the oldest (created) file.")]
    OldestCreated,

    [Display(Name = "First Alphabetical", Description = "First file alphabetically.")]
    FirstAlphabetical,

    [Display(Name = "Last Alphabetical", Description = "Last file alphabetically.")]
    LastAlphabetical
}