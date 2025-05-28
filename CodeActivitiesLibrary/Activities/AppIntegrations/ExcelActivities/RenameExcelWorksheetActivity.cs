using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    // Activity to rename an Excel worksheet
    [DisplayName("Rename Excel Worksheet"), Description("Renames a specific worksheet of an Excel instance.")]
    public class RenameExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The current name of the worksheet.")]
        public InArgument<string> CurrentWorksheetName { get; set; }

        [RequiredArgument, Category("Input"), Description("The new name for the worksheet.")]
        public InArgument<string> NewWorksheetName { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var currentWorksheetName = CurrentWorksheetName.Get(context);
            var newWorksheetName = NewWorksheetName.Get(context);
            var status = "";

            try
            {
                // Simulate renaming the worksheet (actual implementation would use Excel Interop or similar)
                status = $"Simulated renaming of worksheet '{currentWorksheetName}' to '{newWorksheetName}' in Excel instance '{excelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error renaming worksheet: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}