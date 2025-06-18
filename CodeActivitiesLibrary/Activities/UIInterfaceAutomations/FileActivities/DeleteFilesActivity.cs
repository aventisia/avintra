using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    [DisplayName("Delete File(s)")]
    [Description("Deletes one or more files.")]
    public class DeleteFileActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("File(s) to delete")]
        [Description("The path(s) of the file(s) to delete. Supports wildcards like *.txt.")]
        public InArgument<string> FilesToDelete { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var filesToDelete = FilesToDelete.Get(context);

            if (string.IsNullOrWhiteSpace(filesToDelete))
            {
                throw new ArgumentException("Files to delete cannot be empty.");
            }

            try
            {
                var filePatterns = filesToDelete.Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries);
                var deletedFiles = new List<string>();

                foreach (var pattern in filePatterns)
                {
                    var expandedPaths = GetExpandedPaths(pattern);

                    foreach (var filePath in expandedPaths)
                    {
                        if (!File.Exists(filePath))
                        {
                            continue;
                        }

                        File.Delete(filePath);
                        deletedFiles.Add(filePath);
                    }
                }

                if (deletedFiles.Count > 0)
                {
                    StatusMessage.Set(context, $"{deletedFiles.Count} file(s) deleted successfully.");
                }
                else
                {
                    StatusMessage.Set(context, "No files were deleted.");
                }
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Deleting files");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error deleting files: {ex.Message}");
            }
        }

        private IEnumerable<string> GetExpandedPaths(string pattern)
        {
            return Directory.GetFiles(Path.GetDirectoryName(pattern), Path.GetFileName(pattern));
        }
    }
}