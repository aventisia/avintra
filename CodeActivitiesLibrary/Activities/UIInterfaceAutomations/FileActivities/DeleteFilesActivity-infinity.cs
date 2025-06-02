using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    [DisplayName("Delete File(s)"), Description("Deletes one or more files.")]
    public class DeleteFilesActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The file paths to delete.")]
        public InArgument<IEnumerable<string>> FilePaths { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var filePaths = FilePaths.Get(context);
            var status = "";

            try
            {
                foreach (var filePath in filePaths)
                {
                    if (File.Exists(filePath))
                    {
                        File.Delete(filePath);
                    }
                }

                status = "Files deleted successfully.";
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error deleting files: {ex.Message}";
                StatusMessage.Set(context, status);
            }
        }
    }
}