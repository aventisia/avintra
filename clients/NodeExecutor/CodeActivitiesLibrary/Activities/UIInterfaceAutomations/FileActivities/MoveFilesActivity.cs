using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.FileActivities
{
    [DisplayName("Move File(s)")]
    [Description("Moves one or more files to a destination folder. Supports wildcards and multiple source paths separated by semicolons.")]
    [ActivityMetaData(nodeImg: "/assets/File.svg")]
    public class MoveFileActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("File(s) to Move")]
        [Description("The path(s) of the file(s) to move, separated by semicolons (;). Supports wildcards. Examples: C:\\Temp\\report.pdf | C:\\Temp\\*.txt;C:\\Archive\\old_*.docx")]
        public InArgument<string> SourceFiles { get; set; }

        [RequiredArgument]
        [DisplayName("Destination Folder")]
        [Description("The full path of the destination folder. The folder will be created if it does not exist. Example: C:\\Output\\Processed")]
        public InArgument<string> DestinationFolder { get; set; }

        [RequiredArgument]
        [DisplayName("If File Exists")]
        [Description("The action to take when a file with the same name already exists in the destination. Options: DoNothing (skip the file), Overwrite (delete and replace). Default: DoNothing.")]
        [DefaultValue(IfExistsActionEnum.DoNothing)]
        public InArgument<IfExistsActionEnum> IfExistsAction { get; set; }

        [DisplayName("Moved File")]
        [Description("The destination path of the last successfully moved file.")]
        public OutArgument<string> MovedFile { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var sourceFiles = SourceFiles.Get(context);
            var destinationFolder = DestinationFolder.Get(context);
            var ifExistsAction = IfExistsAction.Get(context);

            try
            {
                if (string.IsNullOrWhiteSpace(sourceFiles))
                    throw new ArgumentNullException(nameof(SourceFiles), "Source files path is required.");

                if (string.IsNullOrWhiteSpace(destinationFolder))
                    throw new ArgumentNullException(nameof(DestinationFolder), "Destination folder is required.");

                Directory.CreateDirectory(destinationFolder);

                string lastMovedFile = null;
                var sourceFilePaths = sourceFiles.Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries);

                foreach (var sourceFilePath in sourceFilePaths)
                {
                    foreach (var expandedPath in GetExpandedPaths(sourceFilePath.Trim()))
                    {
                        if (!File.Exists(expandedPath))
                            continue;

                        var fileName = Path.GetFileName(expandedPath);
                        var destinationPath = Path.Combine(destinationFolder, fileName);

                        if (File.Exists(destinationPath))
                        {
                            if (ifExistsAction == IfExistsActionEnum.Overwrite)
                            {
                                File.Delete(destinationPath);
                                File.Move(expandedPath, destinationPath);
                                lastMovedFile = destinationPath;
                            }
                            // IfExistsActionEnum.DoNothing: skip silently
                        }
                        else
                        {
                            File.Move(expandedPath, destinationPath);
                            lastMovedFile = destinationPath;
                        }
                    }
                }

                MovedFile.Set(context, lastMovedFile);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, lastMovedFile != null
                    ? "Files moved successfully."
                    : "No matching files were found to move.");
            }
            catch (UnauthorizedAccessException ex)
            {
                MovedFile.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Access denied: {ex.Message}");
            }
            catch (Exception ex)
            {
                MovedFile.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error moving files: {ex.Message}");
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