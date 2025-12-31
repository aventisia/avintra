using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.FolderActivities
{
    [DisplayName("Rename Folder")]
    [Description(
        "This activity renames an existing folder by specifying the original folder path and the new folder name.")]
    [ActivityMetaData(nodeImg: "/assets/Folder.svg")]
    public class RenameFolderActivity : BaseCodeActivity
    {
        [DisplayName("Original Folder Path")]
        [Description("Specifies the path of the folder that needs to be renamed.")]

        public InArgument<string> OriginalFolderPath { get; set; }


        [DisplayName("New Folder Name")]
        [Description("Specifies the new name for the folder.")]

        public InArgument<string> NewFolderName { get; set; }

        [DisplayName("Renamed Folder Path")]
        [Description("The path of the folder after it has been successfully renamed.")]

        public OutArgument<string> RenamedFolderPath { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            // Retrieve input values
            var originalFolderPath = context.GetValue(OriginalFolderPath);
            var newFolderName = context.GetValue(NewFolderName);

            // Validate inputs
            if (string.IsNullOrWhiteSpace(originalFolderPath))
                throw new ArgumentException("The 'Original Folder Path' cannot be null or empty.");

            if (string.IsNullOrWhiteSpace(newFolderName))
                throw new ArgumentException("The 'New Folder Name' cannot be null or empty.");

            // Ensure the original folder exists
            if (!Directory.Exists(originalFolderPath))
                throw new DirectoryNotFoundException($"The specified folder does not exist: {originalFolderPath}");

            // Construct the new folder path
            var parentDirectory = Path.GetDirectoryName(originalFolderPath);
            var newFolderPath = Path.Combine(parentDirectory, newFolderName);

            try
            {
                // Rename the folder
                Directory.Move(originalFolderPath, newFolderPath);

                // Set the output
                RenamedFolderPath.Set(context, newFolderPath);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Folder renamed successfully to: {newFolderPath}");
            }
            catch (IOException ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to rename the folder: {ex.Message}");
            }
            catch (UnauthorizedAccessException ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Access denied to rename the folder: {ex.Message}");
            }
        }
    }
}