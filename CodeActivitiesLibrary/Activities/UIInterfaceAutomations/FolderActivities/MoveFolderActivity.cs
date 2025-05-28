using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FolderActivities
{
    [DisplayName("Move folder"), Description("Move a folder to a new location.")]
    public class MoveFolderActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The source path of the folder to move.")]
        public InArgument<string> SourceFolderPath { get; set; }

        [RequiredArgument, Category("Input"), Description("The destination path where the folder will be moved.")]
        public InArgument<string> DestinationFolderPath { get; set; }

        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var sourceFolderPath = SourceFolderPath.Get(context);
            var destinationFolderPath = DestinationFolderPath.Get(context);
            var status = "";

            try
            {
                Directory.Move(sourceFolderPath, destinationFolderPath);
                StatusMessage.Set(context, "Folder moved successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error moving folder: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}