using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.FolderActivities
{
    [DisplayName("Delete Folder")]
    [Description("Removes the specified folder and its contents from the file system.")]
    [ActivityMetaData(nodeImg: "/assets/Folder.svg")]
    public class DeleteFolderActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Folder to Delete")]
        [Description("Full path of the folder that you want to delete.")]
        public InArgument<string> FolderPath { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var folderPath = FolderPath.Get(context);

                if (string.IsNullOrWhiteSpace(folderPath))
                    throw new ArgumentException("The folder path cannot be null or empty.");

                if (!Directory.Exists(folderPath))
                    throw new DirectoryNotFoundException($"The folder '{folderPath}' does not exist.");

                Directory.Delete(folderPath, true);

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Folder deleted successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error deleting folder: {ex.Message}");
            }
        }

    }
}