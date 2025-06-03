using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FolderActivities
{

    [DisplayName("Delete Folder")]
    [Description("Removes the specified folder and its contents from the file system.")]
    public class DeleteFolderActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]

        [DisplayName("Folder to Delete")]
        [Description("Full path of the folder that you want to delete.")]
        public InArgument<string> FolderPath { get; set; }
        protected override void Execute(CodeActivityContext context)
        {
            string folderPath = FolderPath.Get(context);

            if (string.IsNullOrWhiteSpace(folderPath))
            {
                throw new ArgumentException("The folder path cannot be null or empty.");
            }

            if (!Directory.Exists(folderPath))
            {
                throw new DirectoryNotFoundException($"The folder '{folderPath}' does not exist.");
            }

            Directory.Delete(folderPath);
        }
    }
}