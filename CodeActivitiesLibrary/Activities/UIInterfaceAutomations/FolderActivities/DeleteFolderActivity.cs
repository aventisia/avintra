using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FolderActivities
{
    [DisplayName("Delete folder")]
    [Description("Delete a folder.")]
    public class DeleteFolderActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The path of the folder to delete.")]
        public InArgument<string> FolderPath { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var folderPath = FolderPath.Get(context);
            var status = "";

            try
            {
                Directory.Delete(folderPath, true);
                StatusMessage.Set(context, "Folder deleted successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error deleting folder: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}