using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    [DisplayName("Get Temporary File"), Description("Creates a uniquely named, empty temporary file on disk.")]
    public class GetTemporaryFileActivity : CodeActivity
    {
        [Category("Output"), Description("Returns the path of the temporary file.")]
        public OutArgument<string> TempFilePath { get; set; }

        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var tempFilePath = "";
            var status = "";

            try
            {
                tempFilePath = Path.GetTempFileName();
                TempFilePath.Set(context, tempFilePath);
                status = "Temporary file created successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error creating temporary file: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}