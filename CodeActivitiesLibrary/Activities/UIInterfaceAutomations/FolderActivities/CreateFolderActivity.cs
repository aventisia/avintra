using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FolderActivities
{
    [DisplayName("Create folder"), Description("Create a new folder.")]
    public class CreateFolderActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The path of the folder to create.")]
        public InArgument<string> FolderPath { get; set; }

        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var folderPath = FolderPath.Get(context);
            var status = "";

            try
            {
                Directory.CreateDirectory(folderPath);
                StatusMessage.Set(context, "Folder created successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error creating folder: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}