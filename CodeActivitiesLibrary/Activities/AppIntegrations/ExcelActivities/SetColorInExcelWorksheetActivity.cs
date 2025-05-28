using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{

    // Activity to set the background color of selected cells in an Excel worksheet
    [DisplayName("Set Color in Excel Worksheet"),
     Description(
         "Fills the background of the selected cells with the specified color, in the active worksheet of an Excel instance.")]
    public class SetColorInExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The range of cells to apply the color to (e.g., 'A1:B10').")]
        public InArgument<string> CellRange { get; set; }

        [RequiredArgument, Category("Input"), Description("The color to apply (e.g., 'Red', 'Blue').")]
        public InArgument<string> Color { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var cellRange = CellRange.Get(context);
            var color = Color.Get(context);
            var status = "";

            try
            {
                // Simulate setting cell color (actual implementation would use Excel Interop or similar)
                status = $"Simulated setting color '{color}' for range '{cellRange}' in Excel instance '{excelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error setting cell color: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}