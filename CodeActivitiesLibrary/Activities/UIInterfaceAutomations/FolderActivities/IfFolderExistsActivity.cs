using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FolderActivities
{
    [DisplayName("If folder exists")]
    [Description("Mark the path if the folder exists.")]
    public class IfFolderExistsActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The path of the folder to check.")]
        public InArgument<string> FolderPath { get; set; }

        [Category("Output")]
        [Description("Returns true if the folder exists, otherwise false.")]
        public OutArgument<bool> Exists { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var folderPath = FolderPath.Get(context);
            var exists = false;
            var status = "";

            try
            {
                exists = Directory.Exists(folderPath);
                StatusMessage.Set(context, "Folder existence checked successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error checking folder existence: {ex.Message}";
            }

            Exists.Set(context, exists);
            StatusMessage.Set(context, status);
        }
    }
}