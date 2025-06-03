using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    [DisplayName("Move File(s)")]
    [Description("Moves one or more files into a destination folder.")]
    public class MoveFileActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("File(s) to move")]
        [Description("The path(s) of the file(s) to move. Supports wildcards like *.txt.")]
        public InArgument<string> SourceFiles { get; set; }

        [RequiredArgument]
        [DisplayName("Destination folder")]
        [Description("The destination folder where the files will be moved.")]
        public InArgument<string> DestinationFolder { get; set; }

        [RequiredArgument]
        [DisplayName("If file exists")]
        [Description("Specifies the behavior when a file already exists in the destination folder.")]
        [DefaultValue(IfExistsActionEnum.DoNothing)]
        public InArgument<IfExistsActionEnum> IfExistsAction { get; set; }


        [DisplayName("Moved File")]
        [Description("Returns the path of the successfully moved file.")]
        public OutArgument<string> MovedFile { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var sourceFiles = SourceFiles.Get(context);
            var destinationFolder = DestinationFolder.Get(context);
            var ifExistsAction = IfExistsAction.Get(context);

            if (string.IsNullOrWhiteSpace(sourceFiles))
            {
                throw new ArgumentException("Source files cannot be empty.");
            }

            if (string.IsNullOrWhiteSpace(destinationFolder))
            {
                throw new ArgumentException("Destination folder cannot be empty.");
            }

            string movedFile = null;

            try
            {
                Directory.CreateDirectory(destinationFolder);

                var sourceFilePaths = sourceFiles.Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries);

                foreach (var sourceFilePath in sourceFilePaths)
                {
                    var expandedPaths = GetExpandedPaths(sourceFilePath);

                    foreach (var expandedPath in expandedPaths)
                    {
                        if (!File.Exists(expandedPath))
                        {
                            continue;
                        }

                        var fileName = Path.GetFileName(expandedPath);
                        var destinationPath = Path.Combine(destinationFolder, fileName);

                        if (File.Exists(destinationPath))
                        {
                            switch (ifExistsAction)
                            {
                                case IfExistsActionEnum.DoNothing:
                                    continue;

                                case IfExistsActionEnum.Overwrite:
                                    File.Delete(destinationPath);
                                    File.Move(expandedPath, destinationPath);
                                    movedFile = destinationPath;
                                    break;

                                default:
                                    throw new ArgumentException("Invalid 'If file exists' action specified.");
                            }
                        }
                        else
                        {
                            File.Move(expandedPath, destinationPath);
                            movedFile = destinationPath;
                        }
                    }
                }

                MovedFile.Set(context, movedFile);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error moving files: {ex.Message}");
            }
        }

        private IEnumerable<string> GetExpandedPaths(string pattern)
        {
            return Directory.GetFiles(Path.GetDirectoryName(pattern) ?? string.Empty, Path.GetFileName(pattern));
        }
    }
}