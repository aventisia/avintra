using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.FileActivities
{
    [DisplayName("Delete File(s)")]
    [Description("Deletes one or more files. Supports wildcards and multiple file paths separated by semicolons.")]
    [ActivityMetaData(nodeImg: "/assets/File.svg")]
    public class DeleteFileActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("File(s) to Delete")]
        [Description("The path(s) of the file(s) to delete, separated by semicolons (;). Supports wildcards. Examples: C:\\Temp\\report.pdf | C:\\Temp\\*.log;C:\\Archive\\old_*.txt")]
        public InArgument<string> FilesToDelete { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var filesToDelete = FilesToDelete.Get(context);

            try
            {
                if (string.IsNullOrWhiteSpace(filesToDelete))
                    throw new ArgumentNullException(nameof(FilesToDelete), "Files to delete path is required.");

                var filePatterns = filesToDelete.Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries);
                var deletedFiles = new List<string>();

                foreach (var pattern in filePatterns)
                {
                    foreach (var filePath in GetExpandedPaths(pattern.Trim()))
                    {
                        if (!File.Exists(filePath))
                            continue;

                        File.Delete(filePath);
                        deletedFiles.Add(filePath);
                    }
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, deletedFiles.Count > 0
                    ? $"{deletedFiles.Count} file(s) deleted successfully."
                    : "No matching files were found to delete.");
            }
            catch (UnauthorizedAccessException ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Access denied: {ex.Message}");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error deleting files: {ex.Message}");
            }
        }

        private IEnumerable<string> GetExpandedPaths(string pattern)
        {
            var directory = Path.GetDirectoryName(pattern);
            var fileName = Path.GetFileName(pattern);

            if (string.IsNullOrEmpty(directory) || string.IsNullOrEmpty(fileName))
                return Enumerable.Empty<string>();

            if (!Directory.Exists(directory))
                return Enumerable.Empty<string>();

            return Directory.EnumerateFiles(directory, fileName);
        }
    }
}