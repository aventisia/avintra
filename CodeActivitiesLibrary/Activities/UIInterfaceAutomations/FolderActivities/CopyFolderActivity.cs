using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FolderActivities
{
    [DisplayName("Copy folder")]
    [Description("Copy a folder to a new location.")]
    public class CopyFolderActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The source path of the folder to copy.")]
        public InArgument<string> SourceFolderPath { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The destination path where the folder will be copied.")]
        public InArgument<string> DestinationFolderPath { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var sourceFolderPath = SourceFolderPath.Get(context);
            var destinationFolderPath = DestinationFolderPath.Get(context);
            var status = "";

            try
            {
                Directory.CreateDirectory(destinationFolderPath);
                foreach (var file in Directory.GetFiles(sourceFolderPath))
                    File.Copy(file, Path.Combine(destinationFolderPath, Path.GetFileName(file)));
                foreach (var subfolder in Directory.GetDirectories(sourceFolderPath))
                    CopyFolderRecursive(subfolder, destinationFolderPath);
                StatusMessage.Set(context, "Folder copied successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error copying folder: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        private void CopyFolderRecursive(string source, string destination)
        {
            Directory.CreateDirectory(destination);
            foreach (var file in Directory.GetFiles(source))
                File.Copy(file, Path.Combine(destination, Path.GetFileName(file)));
            foreach (var subfolder in Directory.GetDirectories(source))
                CopyFolderRecursive(subfolder, Path.Combine(destination, Path.GetFileName(subfolder)));
        }
    }
}