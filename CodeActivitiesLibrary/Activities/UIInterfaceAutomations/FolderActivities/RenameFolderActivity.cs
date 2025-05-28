using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FolderActivities
{
    [DisplayName("Rename folder"), Description("Rename a folder.")]
    public class RenameFolderActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The current path of the folder to rename.")]
        public InArgument<string> CurrentFolderPath { get; set; }

        [RequiredArgument, Category("Input"), Description("The new name for the folder.")]
        public InArgument<string> NewFolderName { get; set; }

        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var currentFolderPath = CurrentFolderPath.Get(context);
            var newFolderName = NewFolderName.Get(context);
            var status = "";

            try
            {
                Directory.Move(currentFolderPath, Path.Combine(Path.GetDirectoryName(currentFolderPath), newFolderName));
                StatusMessage.Set(context, "Folder renamed successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error renaming folder: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}