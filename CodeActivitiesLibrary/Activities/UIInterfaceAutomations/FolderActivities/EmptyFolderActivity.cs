using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FolderActivities
{
    [DisplayName("Empty folder"), Description("Delete all files and subfolders in the folder.")]
    public class EmptyFolderActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The path of the folder to empty.")]
        public InArgument<string> FolderPath { get; set; }

        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var folderPath = FolderPath.Get(context);
            var status = "";

            try
            {
                foreach (var file in Directory.GetFiles(folderPath))
                {
                    File.Delete(file);
                }
                foreach (var subfolder in Directory.GetDirectories(folderPath))
                {
                    Directory.Delete(subfolder, recursive: true);
                }
                StatusMessage.Set(context, "Folder emptied successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error emptying folder: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}