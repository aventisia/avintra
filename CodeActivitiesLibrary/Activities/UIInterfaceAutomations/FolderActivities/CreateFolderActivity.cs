using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FolderActivities
{

    [DisplayName("Create Folder")]
    [Description("Generates a new folder within the specified parent directory using a given folder name.")]
    public class CreateFolderActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Create New Folder Into")]
        [Description("The full path of the parent directory where the new folder should be created.")]
        public InArgument<string> ParentDirectory { get; set; }

        [RequiredArgument]
        [DisplayName("New Folder Name")]
        [Description("The name of the folder to be created inside the specified parent directory.")]
        public InArgument<string> FolderName { get; set; }


        [DisplayName("New Folder")]
        [Description("The full path of the newly created folder, which can be used for further actions.")]
        public OutArgument<string> NewFolder { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string parentPath = ParentDirectory.Get(context);
            string newFolderName = FolderName.Get(context);

            if (string.IsNullOrWhiteSpace(parentPath))
                throw new ArgumentException("Parent directory path cannot be null or empty.");

            if (string.IsNullOrWhiteSpace(newFolderName))
                throw new ArgumentException("New folder name cannot be null or empty.");

            string fullPath = Path.Combine(parentPath, newFolderName);

            if (!Directory.Exists(fullPath))
            {
                Directory.CreateDirectory(fullPath);
            }

            NewFolder.Set(context, fullPath);
        }
    }
}