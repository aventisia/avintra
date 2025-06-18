using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Delete Column from Excel Worksheet")]
    [Description("Deletes a specific column from the active worksheet of an Excel instance.")]
    public class DeleteColumnFromExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [DisplayName("Column Index")]
        [Description("The index (1-based) or letter (e.g., 'A', 'B') of the column to delete.")]
        public InArgument<string> ColumnIndex { get; set; }

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
                var columnIndexInput = ColumnIndex.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet worksheet))
                    throw new InvalidOperationException("Active sheet is not a valid Excel worksheet.");

                int columnNumber;
                if (!int.TryParse(columnIndexInput, out columnNumber))
                {
                    columnNumber = GetColumnIndex(columnIndexInput); // Convert "A", "B" to 1, 2, etc.
                }

                if (columnNumber < 1 || columnNumber > worksheet.Columns.Count)
                    throw new ArgumentOutOfRangeException(nameof(ColumnIndex),
                        $"Column index must be between 1 and {worksheet.Columns.Count}.");

                // ✅ Properly delete the specific column using Range
                ((Excel.Range)worksheet.Columns[columnNumber]).Delete();

                status = $"Successfully deleted column {columnIndexInput} (Index: {columnNumber}).";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);

            }
            catch (Exception ex)
            {
                status = $"Error deleting column: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }

        private int GetColumnIndex(string columnName)
        {
            if (string.IsNullOrWhiteSpace(columnName)) return -1;

            columnName = columnName.Trim().ToUpperInvariant();

            return columnName.Aggregate(0, (acc, c) => acc * 26 + (c - 'A' + 1));
        }
    }
}