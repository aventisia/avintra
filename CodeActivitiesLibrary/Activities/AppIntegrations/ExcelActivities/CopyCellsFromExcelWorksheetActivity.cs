using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{

    // Activity to copy cells from an Excel worksheet
    [DisplayName("Copy Cells from Excel Worksheet"),
     Description("Copies a range of cells from the active worksheet of an Excel instance.")]
    public class CopyCellsFromExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The range of cells to copy (e.g., 'A1:B10').")]
        public InArgument<string> Range { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var range = Range.Get(context);
            var status = "";

            try
            {
                // Simulate copying cells (actual implementation would use Excel Interop or similar)
                status = $"Simulated copying of range '{range}' from Excel instance '{excelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error copying cells: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}