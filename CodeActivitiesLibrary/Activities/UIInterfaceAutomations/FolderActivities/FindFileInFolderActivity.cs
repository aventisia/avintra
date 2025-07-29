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
    [Description("Finds a single file in a folder (and optionally subfolders) based on criteria like largest, smallest, newest, oldest, etc.")]
    public class FindFileInFolderActivity : BaseCodeActivity
    {
        [Required]
        [DisplayName("Folder Path")]
        [Description("The path to the folder to search in.")]
        public InArgument<string> FolderPath { get; set; }

        [Required]
        [DisplayName("Search Option")]
        [Description("Criteria to select the file: Largest, Smallest, Newest, Oldest, etc.")]
        [DefaultValue(FileSearchOption.Largest)]
        public InArgument<FileSearchOption> SearchOption { get; set; }

        [DisplayName("File Filter")]
        [Description("File filter(s), e.g. '*.txt' or '*.jpg;*.png'.")]
        [DefaultValue("*")]
        public InArgument<string> FileFilter { get; set; }

        [DisplayName("Include Subfolders")]
        [Description("If true, includes files from all subfolders.")]
        [DefaultValue(true)]
        public InArgument<bool> IncludeSubfolders { get; set; }

        [DisplayName("Result File Path")]
        [Description("The file path of the found file.")]
        public OutArgument<string> ResultFilePath { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var folderPath = context.GetValue(FolderPath);
            var fileFilter = context.GetValue(FileFilter);
            var includeSubfolders = context.GetValue(IncludeSubfolders);
            var searchOption = context.GetValue(SearchOption);

            try
            {
                if (string.IsNullOrWhiteSpace(fileFilter))
                    fileFilter = "*";

                if (string.IsNullOrWhiteSpace(folderPath) || !Directory.Exists(folderPath))
                    throw new DirectoryNotFoundException($"The specified folder path does not exist: {folderPath}");

                var filters = fileFilter.Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries);
                var searchOpt = includeSubfolders ? System.IO.SearchOption.AllDirectories : System.IO.SearchOption.TopDirectoryOnly;
                var files = filters.SelectMany(f => Directory.GetFiles(folderPath, f.Trim(), searchOpt))
                                   .Where(f => (File.GetAttributes(f) & FileAttributes.Hidden) == 0)
                                   .ToList();

                if (!files.Any())
                {
                    ResultFilePath.Set(context, null);
                    return;
                }

                string result = null;
                switch (searchOption)
                {
                    case FileSearchOption.Largest:
                        result = files.OrderByDescending(f => new FileInfo(f).Length).FirstOrDefault();
                        break;
                    case FileSearchOption.Smallest:
                        result = files.OrderBy(f => new FileInfo(f).Length).FirstOrDefault();
                        break;
                    case FileSearchOption.Newest:
                        result = files.OrderByDescending(f => File.GetLastWriteTime(f)).FirstOrDefault();
                        break;
                    case FileSearchOption.Oldest:
                        result = files.OrderBy(f => File.GetLastWriteTime(f)).FirstOrDefault();
                        break;
                    case FileSearchOption.NewestCreated:
                        result = files.OrderByDescending(f => File.GetCreationTime(f)).FirstOrDefault();
                        break;
                    case FileSearchOption.OldestCreated:
                        result = files.OrderBy(f => File.GetCreationTime(f)).FirstOrDefault();
                        break;
                    case FileSearchOption.FirstAlphabetical:
                        result = files.OrderBy(f => Path.GetFileName(f)).FirstOrDefault();
                        break;
                    case FileSearchOption.LastAlphabetical:
                        result = files.OrderByDescending(f => Path.GetFileName(f)).FirstOrDefault();
                        break;
                    default:
                        result = files.FirstOrDefault();
                        break;
                }

                ResultFilePath.Set(context, result);
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
}
