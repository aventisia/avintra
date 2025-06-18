using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FolderActivities
{
    [DisplayName("Empty Folder")]
    [Description("Removes all files and subdirectories within the specified folder, preserving the folder itself.")]
    public class EmptyFolderActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Folder to Empty")]
        [Description("Specify the path of the folder whose contents should be deleted.")]
        public InArgument<string> FolderPath { get; set; }


        [DisplayName("Include Subfolders")]
        [Description("Determines whether subfolders and their contents should also be deleted.")]
        [DefaultValue(true)]
        public InArgument<bool> DeleteSubfolders { get; set; } = true;

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var folderPath = FolderPath.Get(context);
                var deleteSubfolders = DeleteSubfolders.Get(context);

                if (string.IsNullOrWhiteSpace(folderPath))
                    throw new ArgumentException("Folder path cannot be null or empty.", nameof(folderPath));

                if (!Directory.Exists(folderPath))
                    throw new DirectoryNotFoundException($"The specified folder does not exist: {folderPath}");

                // Delete all files
                foreach (var file in Directory.GetFiles(folderPath))
                {
                    File.Delete(file);
                }

                // Delete subfolders if specified
                if (deleteSubfolders)
                {
                    foreach (var dir in Directory.GetDirectories(folderPath))
                    {
                        Directory.Delete(dir, true); // true enables recursive delete
                    }
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Folder contents deleted successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error deleting folder contents: {ex.Message}");
            }
        }

    }
}