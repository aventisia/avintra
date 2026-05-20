using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.FolderActivities
{
    [DisplayName("Retrieve Files in Folder")]
    [Description("Retrieves the list of files in a specified folder, with options to include subfolders, filter by file type, and sort the results.")]
    [ActivityMetaData(nodeImg: "/assets/Folder.svg")]
    public class GetFilesInFolderActivity : BaseCodeActivity
    {
        [DisplayName("Folder Path")]
        [Description("The full path of the folder to retrieve files from. Example: C:\\Users\\Documents\\Reports")]
        public InArgument<string> FolderPath { get; set; }

        [DisplayName("File Filter")]
        [Description("One or more file patterns separated by semicolons (;). Examples: *.txt;*.pdf;*.docx;invoice_*.xlsx. Default: * (all files).")]
        public InArgument<string> FileFilter { get; set; } = new InArgument<string>("*");

        [DisplayName("Include Subfolders")]
        [Description("When true, searches all subfolders recursively. When false, only the top-level folder is searched. Default: true.")]
        public InArgument<bool> IncludeSubfolders { get; set; } = new InArgument<bool>(true);

        [DisplayName("Fail on Denied Access")]
        [Description("When true, throws an error if access to any folder is denied. When false, inaccessible folders are silently skipped. Default: true.")]
        public InArgument<bool> FailUponDeniedAccess { get; set; } = new InArgument<bool>(true);

        [DisplayName("Sort By")]
        [Description("The primary sort criterion for the retrieved files. Options: NoSort, FullName, RootPath, Directory, Name, NameWithoutExtension, Extension, Size, CreationTime, LastWriteTime. Default: NoSort.")]
        public InArgument<FileSortCriteria> SortBy { get; set; } =
            new InArgument<FileSortCriteria>(FileSortCriteria.NoSort);

        [DisplayName("Descending Order")]
        [Description("When true, sorts results in descending order. When false, sorts in ascending order. Default: false.")]
        public InArgument<bool> Descending { get; set; } = new InArgument<bool>(false);

        [DisplayName("Then By")]
        [Description("The secondary (tiebreaker) sort criterion, applied only when Sort By is not NoSort. Default: NoSort.")]
        public InArgument<FileSortCriteria> ThenBy { get; set; } =
            new InArgument<FileSortCriteria>(FileSortCriteria.NoSort);

        [DisplayName("Retrieved Files")]
        [Description("The list of full file paths that match the specified filter and sort criteria.")]
        public OutArgument<IEnumerable<string>> RetrievedFiles { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var folderPath = context.GetValue(FolderPath);
            var fileFilter = context.GetValue(FileFilter);
            var includeSubfolders = context.GetValue(IncludeSubfolders);
            var failUponDeniedAccess = context.GetValue(FailUponDeniedAccess);
            var sortBy = context.GetValue(SortBy);
            var descending = context.GetValue(Descending);
            var thenBy = context.GetValue(ThenBy);

            try
            {
                if (string.IsNullOrWhiteSpace(folderPath))
                    throw new ArgumentNullException(nameof(FolderPath), "Folder Path is required.");

                if (!Directory.Exists(folderPath))
                    throw new DirectoryNotFoundException($"The specified folder does not exist: {folderPath}");

                if (string.IsNullOrWhiteSpace(fileFilter))
                    fileFilter = "*";

                var files = GetFiles(folderPath, fileFilter, includeSubfolders, failUponDeniedAccess);

                if (sortBy != FileSortCriteria.NoSort)
                    files = SortFiles(files, sortBy, descending, thenBy);

                context.SetValue(RetrievedFiles, files);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Files retrieved successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving files: {ex.Message}");
            }
        }

        private IEnumerable<string> GetFiles(string folderPath, string fileFilter, bool includeSubfolders, bool failUponDeniedAccess)
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

        private IEnumerable<string> EnumerateFilesSkipDenied(string folderPath, string pattern)
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

        private IEnumerable<string> SortFiles(IEnumerable<string> files, FileSortCriteria sortBy, bool descending, FileSortCriteria thenBy)
        {
            // Pre-materialize with FileInfo to avoid repeated disk access inside sort comparisons
            var fileInfos = files.Select(f => new FileInfo(f)).ToList();

            var getSortKey = GetSortKeySelector(sortBy);
            if (getSortKey == null)
                return fileInfos.Select(fi => fi.FullName);

            var ordered = descending
                ? fileInfos.OrderByDescending(getSortKey)
                : fileInfos.OrderBy(getSortKey);

            if (thenBy != FileSortCriteria.NoSort)
            {
                var getThenKey = GetSortKeySelector(thenBy);
                if (getThenKey != null)
                    ordered = descending
                        ? ordered.ThenByDescending(getThenKey)
                        : ordered.ThenBy(getThenKey);
            }

            return ordered.Select(fi => fi.FullName).ToList();
        }

        private static Func<FileInfo, object> GetSortKeySelector(FileSortCriteria criteria)
        {
            switch (criteria)
            {
                case FileSortCriteria.FullName: return fi => fi.FullName;
                case FileSortCriteria.RootPath: return fi => fi.Directory?.Root.FullName;
                case FileSortCriteria.Directory: return fi => fi.DirectoryName;
                case FileSortCriteria.Name: return fi => fi.Name;
                case FileSortCriteria.NameWithoutExtension: return fi => Path.GetFileNameWithoutExtension(fi.Name);
                case FileSortCriteria.Extension: return fi => fi.Extension;
                case FileSortCriteria.Size: return fi => fi.Length;
                case FileSortCriteria.CreationTime: return fi => fi.CreationTime;
                case FileSortCriteria.LastWriteTime: return fi => fi.LastWriteTime;
                default: return null;
            }
        }
    }

    public enum FileSortCriteria
    {
        [Display(Name = "No Sort", Description = "No sorting applied.")]
        NoSort,

        [Display(Name = "Full Name", Description = "Sort by the full file path.")]
        FullName,

        [Display(Name = "Root Path", Description = "Sort by the root drive path (e.g., C:\\).")]
        RootPath,

        [Display(Name = "Directory", Description = "Sort by the parent directory path.")]
        Directory,

        [Display(Name = "Name", Description = "Sort by the file name including extension.")]
        Name,

        [Display(Name = "Name Without Extension", Description = "Sort by the file name without the extension.")]
        NameWithoutExtension,

        [Display(Name = "Extension", Description = "Sort by the file extension (e.g., .pdf, .txt).")]
        Extension,

        [Display(Name = "Size", Description = "Sort by the file size in bytes.")]
        Size,

        [Display(Name = "Creation Time", Description = "Sort by the date and time the file was created.")]
        CreationTime,

        [Display(Name = "Last Write Time", Description = "Sort by the date and time the file was last modified.")]
        LastWriteTime,
    }
}