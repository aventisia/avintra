using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.FolderActivities
{
    [DisplayName("Find File in Folder")]
    [Description("Finds a single file in a folder (and optionally subfolders) that best matches a given criterion such as largest, newest, or first alphabetically.")]
    [ActivityMetaData(nodeImg: "/assets/Folder.svg")]
    public class FindFileInFolderActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Folder Path")]
        [Description("The full path of the folder to search. Example: C:\\Documents\\Reports")]
        public InArgument<string> FolderPath { get; set; }

        [RequiredArgument]
        [DisplayName("Search Option")]
        [Description("The criterion used to select the matching file. Options: Largest, Smallest, Newest, Oldest, NewestCreated, OldestCreated, FirstAlphabetical, LastAlphabetical. Default: Largest.")]
        [DefaultValue(FileSearchOption.Largest)]
        public InArgument<FileSearchOption> SearchOption { get; set; }

        [DisplayName("File Filter")]
        [Description("One or more file patterns separated by semicolons (;). Examples: *.pdf or *.pdf;*.docx. Default: * (all files).")]
        [DefaultValue("*")]
        public InArgument<string> FileFilter { get; set; }

        [DisplayName("Include Subfolders")]
        [Description("When true, searches all subfolders recursively. When false, only the top-level folder is searched. Default: true.")]
        [DefaultValue(true)]
        public InArgument<bool> IncludeSubfolders { get; set; }

        [DisplayName("Result File Path")]
        [Description("The full path of the file that best matches the search criteria. Empty if no matching file is found.")]
        public OutArgument<string> ResultFilePath { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var folderPath = context.GetValue(FolderPath);
            var fileFilter = context.GetValue(FileFilter);
            var includeSubfolders = context.GetValue(IncludeSubfolders);
            var searchOption = context.GetValue(SearchOption);

            try
            {
                if (string.IsNullOrWhiteSpace(folderPath))
                    throw new ArgumentNullException(nameof(FolderPath), "Folder Path is required.");

                if (!Directory.Exists(folderPath))
                    throw new DirectoryNotFoundException($"The specified folder does not exist: {folderPath}");

                if (string.IsNullOrWhiteSpace(fileFilter))
                    fileFilter = "*";

                var searchOpt = includeSubfolders ? System.IO.SearchOption.AllDirectories : System.IO.SearchOption.TopDirectoryOnly;
                var filters = fileFilter.Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries);

                // Pre-compute FileInfo once to avoid repeated disk I/O inside sort comparisons
                var fileInfos = filters
                    .SelectMany(f => Directory.EnumerateFiles(folderPath, f.Trim(), searchOpt))
                    .Distinct()
                    .Where(f => (File.GetAttributes(f) & FileAttributes.Hidden) == 0)
                    .Select(f => new FileInfo(f))
                    .ToList();

                if (!fileInfos.Any())
                {
                    ResultFilePath.Set(context, null);
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, "No matching files found.");
                    return;
                }

                FileInfo result;
                switch (searchOption)
                {
                    case FileSearchOption.Largest:
                        result = fileInfos.OrderByDescending(fi => fi.Length).First();
                        break;
                    case FileSearchOption.Smallest:
                        result = fileInfos.OrderBy(fi => fi.Length).First();
                        break;
                    case FileSearchOption.Newest:
                        result = fileInfos.OrderByDescending(fi => fi.LastWriteTime).First();
                        break;
                    case FileSearchOption.Oldest:
                        result = fileInfos.OrderBy(fi => fi.LastWriteTime).First();
                        break;
                    case FileSearchOption.NewestCreated:
                        result = fileInfos.OrderByDescending(fi => fi.CreationTime).First();
                        break;
                    case FileSearchOption.OldestCreated:
                        result = fileInfos.OrderBy(fi => fi.CreationTime).First();
                        break;
                    case FileSearchOption.FirstAlphabetical:
                        result = fileInfos.OrderBy(fi => fi.Name).First();
                        break;
                    case FileSearchOption.LastAlphabetical:
                        result = fileInfos.OrderByDescending(fi => fi.Name).First();
                        break;
                    default:
                        result = fileInfos.First();
                        break;
                }

                ResultFilePath.Set(context, result.FullName);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "File found successfully.");
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
        [Display(Name = "Largest", Description = "Find the file with the largest size.")]
        Largest,

        [Display(Name = "Smallest", Description = "Find the file with the smallest size.")]
        Smallest,

        [Display(Name = "Newest Modified", Description = "Find the most recently modified file.")]
        Newest,

        [Display(Name = "Oldest Modified", Description = "Find the least recently modified file.")]
        Oldest,

        [Display(Name = "Newest Created", Description = "Find the most recently created file.")]
        NewestCreated,

        [Display(Name = "Oldest Created", Description = "Find the oldest created file.")]
        OldestCreated,

        [Display(Name = "First Alphabetical", Description = "Find the first file in alphabetical order by name.")]
        FirstAlphabetical,

        [Display(Name = "Last Alphabetical", Description = "Find the last file in alphabetical order by name.")]
        LastAlphabetical
    }
}
