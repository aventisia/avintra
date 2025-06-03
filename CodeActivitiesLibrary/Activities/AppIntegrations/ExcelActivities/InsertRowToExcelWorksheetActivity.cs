using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Insert Row to Excel Worksheet")]
    [Description("Inserts a new row above the selected row in the active Excel worksheet.")]
    public class InsertRowToExcelWorksheetActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [DisplayName("Row Index")]
        [Description("The 1-based index of the row where the new row should be inserted (inserted above this row).")]
        public InArgument<int> RowIndex { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


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

                if (!(excelApp.ActiveSheet is Excel.Worksheet ws))
                    throw new InvalidOperationException("Active sheet is not a valid Excel worksheet.");

                // Validate row index
                if (rowIndex < 1 || rowIndex > ws.Rows.Count)
                    throw new ArgumentOutOfRangeException(nameof(RowIndex),
                        $"Row index must be between 1 and {ws.Rows.Count}.");

                // Insert new row at specified index (inserts above the given row)
                (ws.Rows[rowIndex] as Excel.Range)?.Insert();

                status = $"Successfully inserted new row above row {rowIndex}.";
            }
            catch (Exception ex)
            {
                status = $"Error inserting row: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}