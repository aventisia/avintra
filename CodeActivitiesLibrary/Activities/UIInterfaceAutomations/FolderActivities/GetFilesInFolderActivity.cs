using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FolderActivities
{
    [DisplayName("Get files in folder"), Description("Retrieve the list of files in the folder.")]
    public class GetFilesInFolderActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The path of the folder to retrieve files from.")]
        public InArgument<string> FolderPath { get; set; }

        [Category("Output"), Description("Returns the list of file paths in the folder.")]
        public OutArgument<List<string>> Files { get; set; }

        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var folderPath = FolderPath.Get(context);
            List<string> files = null;
            var status = "";

            try
            {
                files = Directory.GetFiles(folderPath).ToList();
                StatusMessage.Set(context, "Files retrieved successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error retrieving files: {ex.Message}";
            }

            Files.Set(context, files);
            StatusMessage.Set(context, status);
        }
    }
}