using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FolderActivities
{
    [DisplayName("Rename Folder")]
    [Description("This activity renames an existing folder by specifying the original folder path and the new folder name.")]
    public class RenameFolderActivity : Extensions.BaseCodeActivity
    {

        [DisplayName("Original Folder Path")]
        [Description("Specifies the path of the folder that needs to be renamed.")]
        [Category("Input")]
        public InArgument<string> OriginalFolderPath { get; set; }


        [DisplayName("New Folder Name")]
        [Description("Specifies the new name for the folder.")]
        [Category("Input")]
        public InArgument<string> NewFolderName { get; set; }

        [DisplayName("Renamed Folder Path")]
        [Description("The path of the folder after it has been successfully renamed.")]
        [Category("Output")]
        public OutArgument<string> RenamedFolderPath { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            // Retrieve input values
            string originalFolderPath = context.GetValue(OriginalFolderPath);
            string newFolderName = context.GetValue(NewFolderName);

            // Validate inputs
            if (string.IsNullOrWhiteSpace(originalFolderPath))
            {
                throw new ArgumentException("The 'Original Folder Path' cannot be null or empty.");
            }

            if (string.IsNullOrWhiteSpace(newFolderName))
            {
                throw new ArgumentException("The 'New Folder Name' cannot be null or empty.");
            }

            // Ensure the original folder exists
            if (!Directory.Exists(originalFolderPath))
            {
                throw new DirectoryNotFoundException($"The specified folder does not exist: {originalFolderPath}");
            }

            // Construct the new folder path
            string parentDirectory = Path.GetDirectoryName(originalFolderPath);
            string newFolderPath = Path.Combine(parentDirectory, newFolderName);

            try
            {
                // Rename the folder
                Directory.Move(originalFolderPath, newFolderPath);

                // Set the output
                context.SetValue(RenamedFolderPath, newFolderPath);
            }
            catch (IOException ex)
            {
                throw new IOException($"Failed to rename the folder: {ex.Message}", ex);
            }
            catch (UnauthorizedAccessException ex)
            {
                throw new UnauthorizedAccessException($"Access denied to rename the folder: {ex.Message}", ex);
            }
        }
    }

}