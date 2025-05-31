using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    [DisplayName("Copy File(s)"), Description("Copies one or more files into a destination folder.")]
    public class CopyFilesActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The source file paths to copy.")]
        public InArgument<IEnumerable<string>> SourceFilePaths { get; set; }

        [RequiredArgument, Category("Input"), Description("The destination folder where files should be copied.")]
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

                    File.Copy(sourceFilePath, destinationPath, true);
                }

                status = "Files copied successfully.";
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error copying files: {ex.Message}";
                StatusMessage.Set(context, status);
            }
        }
    }
}