using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Insert Column to Excel Worksheet")]
    [Description("Inserts a new column to the left of the specified column in the active Excel worksheet.")]
    public class InsertColumnToExcelWorksheetActivity : Extensions.BaseCodeActivity
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
        [DisplayName("Column Reference")]
        [Description(
            "The 1-based index or letter (e.g., 'A', 'B') of the column where the new column should be inserted.")]
        public InArgument<string> ColumnReference { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")] 

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var colRef = ColumnReference.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet ws))
                    throw new InvalidOperationException("Active sheet is not a valid Excel worksheet.");

                int columnIndex;

                // Convert column reference to index
                if (!int.TryParse(colRef, out columnIndex))
                    // Convert column letter to index (e.g., "A" → 1, "B" → 2)
                    columnIndex = GetColumnIndex(colRef);

                if (columnIndex < 1 || columnIndex > ws.Columns.Count)
                    throw new ArgumentOutOfRangeException(nameof(ColumnReference),
                        $"Invalid column reference: {colRef}");

                // Insert new column at specified index
                (ws.Columns[columnIndex] as Excel.Range)?.Insert();

                status = $"Successfully inserted new column to the left of column {colRef}.";
            }
            catch (Exception ex)
            {
                status = $"Error inserting column: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        // Helper method to convert column letter to index
        private static int GetColumnIndex(string columnName)
        {
            if (string.IsNullOrWhiteSpace(columnName))
                throw new ArgumentException("Column name cannot be empty.", nameof(columnName));

            columnName = columnName.ToUpperInvariant();

            return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
        }
    }
}