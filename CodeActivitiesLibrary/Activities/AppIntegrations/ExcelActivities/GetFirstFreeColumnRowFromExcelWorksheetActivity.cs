using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Get First Free Column/Row from Excel Worksheet")]
    [Description(
        "Retrieves the first free column and/or row of the active worksheet. This is useful for adding new data into a worksheet that already has data in it.")]
    public class GetFirstFreeColumnRowFromExcelWorksheetActivity : CodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
        [DisplayName("First Free Column")]
        [Description("Returns the first free column as a letter (e.g., 'A', 'B').")]
        public OutArgument<string> FirstFreeColumn { get; set; }

        [Category("Output")]
        [DisplayName("First Free Row")]
        [Description("Returns the first free row as a number.")]
        public OutArgument<int> FirstFreeRow { get; set; }

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

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet ws))
                    throw new InvalidOperationException("Active sheet is not a valid Excel worksheet.");

                // Get last used row and column
                long lastRow = ws.UsedRange.Rows.Count;
                long lastCol = ws.UsedRange.Columns.Count;

                // First free positions
                var firstFreeRow = (int)(lastRow + 1);
                var firstFreeColumn = IndexToColumnLetter(lastCol + 1);

                FirstFreeColumn.Set(context, firstFreeColumn);
                FirstFreeRow.Set(context, firstFreeRow);
            }
            catch (Exception ex)
            {
                status = $"Error retrieving first free column/row: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        // Helper method to convert column index to Excel column name
        private static string IndexToColumnLetter(long columnIndex)
        {
            if (columnIndex <= 0)
                throw new ArgumentException("Column index must be a positive value.", nameof(columnIndex));

            var colLetters = new char[26];
            for (var i = 0; i < 26; i++) colLetters[i] = (char)('A' + i);

            var columnName = string.Empty;
            while (columnIndex > 0)
            {
                columnIndex--;
                columnName = colLetters[columnIndex % 26] + columnName;
                columnIndex /= 26;
            }

            return columnName;
        }
    }
}