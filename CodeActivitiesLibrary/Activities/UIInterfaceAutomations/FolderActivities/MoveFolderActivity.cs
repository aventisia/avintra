using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FolderActivities
{
        [DisplayName("Move Folder")]
        [Description("This activity moves an existing folder to a specified destination folder.")]
        public class MoveFolderActivity : CodeActivity
        {
            
            [DisplayName("Folder to Move")]
            [Description("Specifies the path of the folder that needs to be moved.")]
            [Category("Input")]
            public InArgument<string> SourceFolderPath { get; set; }

          
            [DisplayName("Destination Folder")]
            [Description("Specifies the path of the destination folder where the source folder will be moved.")]
            [Category("Input")]
            public InArgument<string> DestinationFolderPath { get; set; }

            [DisplayName("Moved Folder Path")]
            [Description("The path of the folder after it has been successfully moved.")]
            [Category("Output")]
            public OutArgument<string> MovedFolderPath { get; set; }

          
            protected override void Execute(CodeActivityContext context)
            {
                // Retrieve input values
                string sourceFolderPath = context.GetValue(SourceFolderPath);
                string destinationFolderPath = context.GetValue(DestinationFolderPath);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(sourceFolderPath))
                {
                    throw new ArgumentException("The 'Folder to Move' cannot be null or empty.");
                }

                if (string.IsNullOrWhiteSpace(destinationFolderPath))
                {
                    throw new ArgumentException("The 'Destination Folder' cannot be null or empty.");
                }

                // Ensure the source folder exists
                if (!Directory.Exists(sourceFolderPath))
                {
                    throw new DirectoryNotFoundException($"The specified folder does not exist: {sourceFolderPath}");
                }

                try
                {
                    // Construct the full path of the moved folder
                    string destinationFullPath = Path.Combine(destinationFolderPath, Path.GetFileName(sourceFolderPath));

                    // Move the folder
                    Directory.Move(sourceFolderPath, destinationFullPath);

                    // Set the output
                    context.SetValue(MovedFolderPath, destinationFullPath);
                }
                catch (IOException ex)
                {
                    throw new IOException($"Failed to move the folder: {ex.Message}", ex);
                }
                catch (UnauthorizedAccessException ex)
                {
                    throw new UnauthorizedAccessException($"Access denied to move the folder: {ex.Message}", ex);
                }
            }
        }
    
}