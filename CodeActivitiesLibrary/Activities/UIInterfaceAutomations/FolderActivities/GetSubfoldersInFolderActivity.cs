using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FolderActivities
{
    [DisplayName("Get subfolders in folder")]
    [Description("Retrieve the list of subfolders in the folder.")]
    public class GetSubfoldersInFolderActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The path of the folder to retrieve subfolders from.")]
        public InArgument<string> FolderPath { get; set; }

        [Category("Output")]
        [Description("Returns the list of subfolder paths in the folder.")]
        public OutArgument<List<string>> Subfolders { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var folderPath = FolderPath.Get(context);
            List<string> subfolders = null;
            var status = "";

            try
            {
                subfolders = Directory.GetDirectories(folderPath).ToList();
                StatusMessage.Set(context, "Subfolders retrieved successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error retrieving subfolders: {ex.Message}";
            }

            Subfolders.Set(context, subfolders);
            StatusMessage.Set(context, status);
        }
    }
}