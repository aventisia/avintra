using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.FolderActivities
{
    [DisplayName("Create Folder")]
    [Description("Generates a new folder within the specified parent directory using a given folder name.")]
    [ActivityMetaData(nodeImg: "/assets/Folder.svg")]
    public class CreateFolderActivity : BaseCodeActivity
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
            try
            {
                var parentPath = ParentDirectory.Get(context);
                var newFolderName = FolderName.Get(context);

                if (string.IsNullOrWhiteSpace(parentPath))
                    throw new ArgumentException("Parent directory path cannot be null or empty.");

                if (string.IsNullOrWhiteSpace(newFolderName))
                    throw new ArgumentException("New folder name cannot be null or empty.");

                var fullPath = Path.Combine(parentPath, newFolderName);

                if (!Directory.Exists(fullPath))
                {
                    Directory.CreateDirectory(fullPath);
                }

                NewFolder.Set(context, fullPath);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Folder created successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error creating folder: {ex.Message}");
            }
        }
    }
}