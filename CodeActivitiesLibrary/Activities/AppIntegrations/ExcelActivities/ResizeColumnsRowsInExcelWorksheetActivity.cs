using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{

    // Activity to resize columns/rows in an Excel worksheet
    [DisplayName("Resize Columns/Rows in Excel Worksheet"),
     Description("Resizes a selection of columns or rows in the active worksheet of an Excel instance.")]
    public class ResizeColumnsRowsInExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The column or row indices to resize (e.g., 'A1:B10').")]
        public InArgument<string> Range { get; set; }

        [RequiredArgument, Category("Input"), Description("The width or height for resizing.")]
        public InArgument<double> Size { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var range = Range.Get(context);
            var size = Size.Get(context);
            var status = "";

            try
            {
                // Simulate resizing columns/rows (actual implementation would use Excel Interop or similar)
                status = $"Simulated resizing of range '{range}' to size {size} in Excel instance '{excelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error resizing columns/rows: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}
