using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FolderActivities
{
    [DisplayName("Get special folder"),
     Description("Retrieve the path of a special folder such as My Documents, Desktop, etc.")]
    public class GetSpecialFolderActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The type of special folder to retrieve.")]
        public InArgument<Environment.SpecialFolder> SpecialFolderType { get; set; }

        [Category("Output"), Description("Returns the path of the special folder.")]
        public OutArgument<string> FolderPath { get; set; }

        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var specialFolderType = SpecialFolderType.Get(context);
            string folderPath = null;
            var status = "";

            try
            {
                folderPath = Environment.GetFolderPath(specialFolderType);
                StatusMessage.Set(context, "Special folder path retrieved successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error retrieving special folder path: {ex.Message}";
            }

            FolderPath.Set(context, folderPath);
            StatusMessage.Set(context, status);
        }
    }
}