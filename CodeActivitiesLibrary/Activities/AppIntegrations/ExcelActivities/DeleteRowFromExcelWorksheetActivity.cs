using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Delete Row from Excel Worksheet")]
    [Description("Deletes a specific row from the active worksheet of an Excel instance.")]
    public class DeleteRowFromExcelWorksheetActivity : CodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Row Index")]
        [Description("The index (1-based) of the row to delete.")]
        public InArgument<int> RowIndex { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")] public OutArgument<string> StatusMessage { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var rowIndex = RowIndex.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet worksheet))
                    throw new InvalidOperationException("Active sheet is not a valid Excel worksheet.");

                if (rowIndex < 1 || rowIndex > worksheet.Rows.Count)
                    throw new ArgumentOutOfRangeException(nameof(RowIndex),
                        $"Row index must be between 1 and {worksheet.Rows.Count}.");

                // Delete the specified row
                worksheet.Rows.Delete(rowIndex);

                status = $"Successfully deleted row at index {rowIndex}.";
            }
            catch (Exception ex)
            {
                status = $"Error deleting row: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}