using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    // Activity to launch a new Excel instance
    [DisplayName("Launch Excel"), Description("Launches a new Excel instance or opens an Excel document.")]
    public class LaunchExcelActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The path to the Excel file to open (optional).")]
        public InArgument<string> FilePath { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var filePath = FilePath.Get(context);
            var status = "";

            try
            {
                // Simulate launching Excel (actual implementation would use Process.Start or similar)
                status = $"Simulated launch of Excel with file path: '{filePath}'.";
            }
            catch (Exception ex)
            {
                status = $"Error launching Excel: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}