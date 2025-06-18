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
    [Description(
        "This activity retrieves the list of files in a specified folder, with options to include subfolders and sort the results.")]
    public class GetFilesInFolderActivity : BaseCodeActivity
    {
        [DisplayName("Folder Path")]
        [Description("Specifies the path to the folder where files will be retrieved.")]

        public InArgument<string> FolderPath { get; set; }

        [DisplayName("File Filter")]
        [Description("A pattern to filter the files (e.g., \"*.txt\" for text files).")]

        public InArgument<string> FileFilter { get; set; } = new InArgument<string>("*");

        [DisplayName("Include Subfolders")]
        [Description("If true, includes files from all subfolders within the specified folder.")]

        public InArgument<bool> IncludeSubfolders { get; set; } = new InArgument<bool>(true);

        [DisplayName("Fail on Denied Access")]
        [Description("If true, the activity will fail if access to any subfolder is denied.")]

        public InArgument<bool> FailUponDeniedAccess { get; set; } = new InArgument<bool>(true);

        [DisplayName("Sort By")]
        [Description("The primary criterion to sort the retrieved files (e.g., \"Name\", \"LastWriteTime\").")]

        public InArgument<FileSortCriteria> SortBy { get; set; } =
            new InArgument<FileSortCriteria>(FileSortCriteria.NoSort);

        [DisplayName("Descending Order")]
        [Description("If true, sorts the files in descending order based on the primary sort criterion.")]

        public InArgument<bool> Descending { get; set; } = new InArgument<bool>(false);

        [DisplayName("Then By")]
        [Description("The secondary criterion to sort the retrieved files (e.g., \"Size\", \"CreationTime\").")]

        public InArgument<FileSortCriteria> ThenBy { get; set; } =
            new InArgument<FileSortCriteria>(FileSortCriteria.NoSort);

        [DisplayName("Retrieved Files")]
        [Description("The list of files that were retrieved based on the specified criteria.")]

        public OutArgument<IEnumerable<string>> RetrievedFiles { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input values
                var folderPath = context.GetValue(FolderPath);
                var fileFilter = context.GetValue(FileFilter);
                var includeSubfolders = context.GetValue(IncludeSubfolders);
                var failUponDeniedAccess = context.GetValue(FailUponDeniedAccess);
                var sortBy = context.GetValue(SortBy);
                var descending = context.GetValue(Descending);
                var thenBy = context.GetValue(ThenBy);

                // Validate folder path
                if (!Directory.Exists(folderPath))
                    throw new DirectoryNotFoundException($"The specified folder path does not exist: {folderPath}");

                // Retrieve files based on the filter and subfolder inclusion
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


        private IEnumerable<string> GetFiles(string folderPath, string fileFilter, bool includeSubfolders,
            bool failUponDeniedAccess)
        {
            try
            {
                if (includeSubfolders)
                    return Directory.GetFiles(folderPath, fileFilter, SearchOption.AllDirectories);
                else
                    return Directory.GetFiles(folderPath, fileFilter, SearchOption.TopDirectoryOnly);
            }
            catch (UnauthorizedAccessException ex)
            {
                if (failUponDeniedAccess)
                    throw new UnauthorizedAccessException($"Access denied to folder: {folderPath}", ex);
                else
                    return Enumerable.Empty<string>();
            }
        }

        private IEnumerable<string> SortFiles(IEnumerable<string> files, FileSortCriteria sortBy, bool descending,
            FileSortCriteria thenBy)
        {
            Func<string, object> getSortKey = null;
            switch (sortBy)
            {
                case FileSortCriteria.FullName:
                    getSortKey = f => f;
                    break;
                case FileSortCriteria.RootPath:
                    getSortKey = f => Path.GetPathRoot(f);
                    break;
                case FileSortCriteria.Directory:
                    getSortKey = f => Path.GetDirectoryName(f);
                    break;
                case FileSortCriteria.Name:
                    getSortKey = f => Path.GetFileName(f);
                    break;
                case FileSortCriteria.NameWithoutExtension:
                    getSortKey = f => Path.GetFileNameWithoutExtension(f);
                    break;
                case FileSortCriteria.Extension:
                    getSortKey = f => Path.GetExtension(f);
                    break;
                case FileSortCriteria.Size:
                    getSortKey = f => new FileInfo(f).Length;
                    break;
                default:
                    getSortKey = null;
                    break;
            }

            if (getSortKey == null)
                return files;

            Func<string, object> getThenKey = null;
            switch (thenBy)
            {
                case FileSortCriteria.FullName:
                    getThenKey = f => f;
                    break;
                case FileSortCriteria.RootPath:
                    getThenKey = f => Path.GetPathRoot(f);
                    break;
                case FileSortCriteria.Directory:
                    getThenKey = f => Path.GetDirectoryName(f);
                    break;
                case FileSortCriteria.Name:
                    getThenKey = f => Path.GetFileName(f);
                    break;
                case FileSortCriteria.NameWithoutExtension:
                    getThenKey = f => Path.GetFileNameWithoutExtension(f);
                    break;
                case FileSortCriteria.Extension:
                    getThenKey = f => Path.GetExtension(f);
                    break;
                case FileSortCriteria.Size:
                    getThenKey = f => new FileInfo(f).Length;
                    break;
                default:
                    getThenKey = null;
                    break;
            }

            var orderedFiles = descending
                ? files.OrderByDescending(getSortKey)
                : files.OrderBy(getSortKey);

            if (thenBy != FileSortCriteria.NoSort && getThenKey != null)
                orderedFiles = descending
                    ? orderedFiles.ThenByDescending(getThenKey)
                    : orderedFiles.ThenBy(getThenKey);

            return orderedFiles.ToList();
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
}