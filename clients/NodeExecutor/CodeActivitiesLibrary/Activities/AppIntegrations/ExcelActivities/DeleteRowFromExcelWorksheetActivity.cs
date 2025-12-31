using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Delete Row from Excel Worksheet")]
    [Description("Deletes a specific row from the specified worksheet of an Excel workbook.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class DeleteRowFromExcelWorksheetActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The Excel Worksheet object where the row will be deleted.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Row Index")]
        [Description("The index (1-based) of the row to delete.")]
        public InArgument<int> RowIndex { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string status;

            try
            {
                var worksheet = WorksheetInstance.Get(context);
                var rowIndex = RowIndex.Get(context);

                if (worksheet == null)
                    throw new InvalidOperationException("Worksheet instance cannot be null.");

                if (rowIndex < 1)
                    throw new ArgumentOutOfRangeException(nameof(RowIndex), "Row index must be greater than or equal to 1.");

                // Get the parent workbook safely
                var workbook = worksheet.Parent as Excel.Workbook;

                // Disable alerts to prevent confirmation popups (if applicable)
                if (workbook?.Application != null)
                    workbook.Application.DisplayAlerts = false;

                // Delete the specified row
                Excel.Range row = worksheet.Rows[rowIndex] as Excel.Range;
                row.Delete();

                status = $"Successfully deleted row at index {rowIndex}.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error deleting row: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}