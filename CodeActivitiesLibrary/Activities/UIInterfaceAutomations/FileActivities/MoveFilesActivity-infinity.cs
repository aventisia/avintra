using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    [DisplayName("Move File(s)"), Description("Moves one or more files into a destination folder.")]
    public class MoveFilesActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The source file paths to move.")]
        public InArgument<IEnumerable<string>> SourceFilePaths { get; set; }

        [RequiredArgument, Category("Input"), Description("The destination folder where files should be moved.")]
        public InArgument<string> DestinationFolder { get; set; }

        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var sourceFilePaths = SourceFilePaths.Get(context);
            var destinationFolder = DestinationFolder.Get(context);
            var status = "";

            try
            {
                foreach (var sourceFilePath in sourceFilePaths)
                {
                    if (!File.Exists(sourceFilePath))
                        throw new ArgumentException($"Source file not found: {sourceFilePath}");

                    var fileName = Path.GetFileName(sourceFilePath);
                    var destinationPath = Path.Combine(destinationFolder, fileName);

                    File.Move(sourceFilePath, destinationPath);
                }

                status = "Files moved successfully.";
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error moving files: {ex.Message}";
                StatusMessage.Set(context, status);
            }
        }
    }
}