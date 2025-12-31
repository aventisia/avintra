using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Get First Free Column or Row from Excel Worksheet")]
    [Description(
        "Retrieves the first free column and/or row from the specified worksheet. Useful for appending new data.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class GetFirstFreeColumnRowFromExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The target Excel worksheet instance to analyze.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("First Free Column")]
        [Description("Returns the first free column as a letter (e.g., 'A', 'B', 'C').")]
        public OutArgument<string> FirstFreeColumn { get; set; }

        [DisplayName("First Free Row")]
        [Description("Returns the first free row as a number.")]
        public OutArgument<int> FirstFreeRow { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var worksheet = WorksheetInstance.Get(context);

                if (worksheet == null)
                {
                    var excelApp = (Excel.Application)System.Runtime.InteropServices.Marshal.GetActiveObject("Excel.Application");
                    worksheet = excelApp?.ActiveSheet as Excel.Worksheet;
                }

                if (worksheet == null)
                    throw new InvalidOperationException("Worksheet instance is not available or invalid.");

                // Safely get UsedRange (handle empty worksheet)
                Excel.Range usedRange = worksheet.UsedRange;
                long lastRow = 0;
                long lastCol = 0;

                if (usedRange != null && usedRange.Cells.Count > 1)
                {
                    lastRow = usedRange.Row + usedRange.Rows.Count - 1;
                    lastCol = usedRange.Column + usedRange.Columns.Count - 1;
                }

                // Compute next available (free) row/column
                int firstFreeRow = (int)(lastRow + 1);
                string firstFreeColumn = IndexToColumnLetter(lastCol + 1);

                // Set output
                FirstFreeColumn.Set(context, firstFreeColumn);
                FirstFreeRow.Set(context, firstFreeRow);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context,
                    $"Retrieved first free cell successfully — Row: {firstFreeRow}, Column: {firstFreeColumn}");
            }
            catch (Exception ex)
            {
                FirstFreeColumn.Set(context, null);
                FirstFreeRow.Set(context, 0);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving first free column/row: {ex.Message}");
            }
        }

        // Helper method to convert column index to Excel column name
        private static string IndexToColumnLetter(long columnIndex)
        {
            if (columnIndex <= 0)
                throw new ArgumentException("Column index must be positive.", nameof(columnIndex));

            string columnName = string.Empty;
            while (columnIndex > 0)
            {
                columnIndex--;
                columnName = (char)('A' + (columnIndex % 26)) + columnName;
                columnIndex /= 26;
            }

            return columnName;
        }
    }
}