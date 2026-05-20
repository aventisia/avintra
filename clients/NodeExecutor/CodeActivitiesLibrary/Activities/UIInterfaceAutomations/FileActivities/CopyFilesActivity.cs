using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.FileActivities
{
    [DisplayName("Copy File(s)")]
    [Description("Copies one or more files to a destination folder. Supports wildcards and multiple source paths separated by semicolons.")]
    [ActivityMetaData(nodeImg: "/assets/File.svg")]
    public class CopyFileActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("File(s) to Copy")]
        [Description("The path(s) of the file(s) to copy, separated by semicolons (;). Supports wildcards. Examples: C:\\Docs\\report.pdf | C:\\Docs\\*.txt;C:\\Archive\\*.pdf")]
        public InArgument<string> SourceFiles { get; set; }

        [RequiredArgument]
        [DisplayName("Destination Folder")]
        [Description("The full path of the destination folder. The folder will be created if it does not exist. Example: C:\\Output\\Reports")]
        public InArgument<string> DestinationFolder { get; set; }

        [RequiredArgument]
        [DisplayName("If File Exists")]
        [Description("The action to take when a file with the same name already exists in the destination. Options: DoNothing (skip the file), Overwrite (replace it). Default: DoNothing.")]
        [DefaultValue(IfExistsActionEnum.DoNothing)]
        public InArgument<IfExistsActionEnum> IfExistsAction { get; set; }

        [DisplayName("Copied Files")]
        [Description("The list of full destination paths for all successfully copied files.")]
        public OutArgument<IEnumerable<string>> CopiedFiles { get; set; }

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

                var sourceFilePaths = sourceFiles.Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries);
                var copiedFiles = new List<string>();

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
                                File.Copy(expandedPath, destinationPath, overwrite: true);
                                copiedFiles.Add(destinationPath);
                            }
                            // IfExistsActionEnum.DoNothing: skip silently
                        }
                        else
                        {
                            File.Copy(expandedPath, destinationPath);
                            copiedFiles.Add(destinationPath);
                        }
                    }
                }

                CopiedFiles.Set(context, copiedFiles);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"{copiedFiles.Count} file(s) copied successfully.");
            }
            catch (UnauthorizedAccessException ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Access denied: {ex.Message}");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error copying files: {ex.Message}");
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