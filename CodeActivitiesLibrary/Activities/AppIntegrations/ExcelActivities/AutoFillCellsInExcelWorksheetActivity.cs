using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{

    // Activity to auto-fill a range with data based on another range in the active worksheet of an Excel instance
    [DisplayName("Auto Fill Cells in Excel Worksheet"),
     Description(
         "Auto fills a range with data, based on the data of another range, in the active worksheet of an Excel instance.")]
    public class AutoFillCellsInExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The source range to base the auto-fill on (e.g., 'A1:A5').")]
        public InArgument<string> SourceRange { get; set; }

        [RequiredArgument, Category("Input"), Description("The target range to auto-fill (e.g., 'A6:A10').")]
        public InArgument<string> TargetRange { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var sourceRange = SourceRange.Get(context);
            var targetRange = TargetRange.Get(context);
            var status = "";

            try
            {
                // Simulate auto-filling cells (actual implementation would use Excel Interop or similar)
                status = $"Simulated auto-fill from range '{sourceRange}' to '{targetRange}' in Excel instance '{excelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error auto-filling cells: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}