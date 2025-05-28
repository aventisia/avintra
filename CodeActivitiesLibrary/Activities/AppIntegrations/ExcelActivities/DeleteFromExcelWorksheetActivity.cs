using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    // Activity to delete a cell or range of cells from the active worksheet of an Excel instance
    [DisplayName("Delete from Excel Worksheet"),
     Description("Deletes a cell or a range of cells from the active worksheet of an Excel instance.")]
    public class DeleteFromExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The range of cells to delete (e.g., 'A1:B10').")]
        public InArgument<string> RangeToDelete { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var rangeToDelete = RangeToDelete.Get(context);
            var status = "";

            try
            {
                // Simulate deleting cells (actual implementation would use Excel Interop or similar)
                status = $"Simulated deletion of range '{rangeToDelete}' in Excel instance '{excelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error deleting cells: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}