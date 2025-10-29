using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Insert Column to Excel Worksheet")]
    [Description("Inserts a new column to the left of the specified column in the provided Excel worksheet.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class InsertColumnToExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The Excel Worksheet object where the new column will be inserted.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Column Reference")]
        [Description("The 1-based index or letter (e.g., 'A', 'B') of the column where the new column should be inserted.")]
        public InArgument<string> ColumnReference { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var worksheet = WorksheetInstance.Get(context);
                var colRef = ColumnReference.Get(context);

                if (worksheet == null)
                    throw new InvalidOperationException("Worksheet instance is required but was not provided.");

                if (string.IsNullOrWhiteSpace(colRef))
                    throw new ArgumentException("Column reference cannot be empty.", nameof(ColumnReference));

                int columnIndex;

                // Convert column reference to index
                if (!int.TryParse(colRef, out columnIndex))
                {
                    // Convert column letter to index (e.g., "A" → 1, "B" → 2)
                    columnIndex = GetColumnIndex(colRef);
                }

                if (columnIndex < 1 || columnIndex > worksheet.Columns.Count)
                    throw new ArgumentOutOfRangeException(nameof(ColumnReference), $"Invalid column reference: {colRef}");

                // Insert new column at the specified position
                (worksheet.Columns[columnIndex] as Excel.Range)?.Insert();

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully inserted new column to the left of column {colRef}.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error inserting column: {ex.Message}");
            }
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