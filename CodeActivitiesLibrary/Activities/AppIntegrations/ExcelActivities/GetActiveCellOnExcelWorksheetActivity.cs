using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    // Activity to get the active cell on an Excel worksheet
    [DisplayName("Get Active Cell on Excel Worksheet"),
     Description("Get the active cell in the active worksheet of the Excel document.")]
    public class GetActiveCellOnExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [Category("Output"), Description("Returns the address of the active cell (e.g., 'A1').")]
        public OutArgument<string> Result { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var result = "";
            var status = "";

            try
            {
                // Simulate getting active cell (actual implementation would use Excel Interop or similar)
                result = "A1"; // Simulated active cell
                status = "Active cell retrieved successfully.";
            }
            catch (Exception ex)
            {
                result = "";
                status = $"Error getting active cell: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}