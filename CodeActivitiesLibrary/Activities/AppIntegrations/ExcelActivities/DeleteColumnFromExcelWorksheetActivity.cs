using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Delete Column from Excel Worksheet")]
    [Description("Deletes a specific column from the active worksheet of an Excel instance.")]
    public class DeleteColumnFromExcelWorksheetActivity : CodeActivity
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
        [DisplayName("Column Index")]
        [Description("The index (1-based) or letter (e.g., 'A', 'B') of the column to delete.")]
        public InArgument<string> ColumnIndex { get; set; }

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
                var columnIndex = ColumnIndex.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet worksheet))
                    throw new InvalidOperationException("Active sheet is not available or not a valid worksheet.");

                int colNum;

                if (!int.TryParse(columnIndex, out colNum))
                    // Convert column letter (like "A", "B") to number
                    colNum = GetColumnIndex(columnIndex);

                if (colNum < 1 || colNum > worksheet.Columns.Count)
                    throw new ArgumentOutOfRangeException(nameof(ColumnIndex),
                        $"Column index must be between 1 and {worksheet.Columns.Count}.");

                // Delete the column
                worksheet.Columns.Delete(colNum);

                status = $"Successfully deleted column at index {colNum}.";
            }
            catch (Exception ex)
            {
                status = $"Error deleting column: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        // Helper method to convert column letters to numbers
        private int GetColumnIndex(string columnName)
        {
            if (string.IsNullOrEmpty(columnName)) return -1;

            columnName = columnName.ToUpperInvariant();

            return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
        }
    }
}