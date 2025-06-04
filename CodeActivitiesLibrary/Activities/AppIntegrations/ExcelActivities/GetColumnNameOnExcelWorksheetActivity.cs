using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Get Column Name on Excel Worksheet")]
    [Description("Gets the name of a column (e.g., 'A', 'B') based on its index in the active worksheet.")]
    public class GetColumnNameOnExcelWorksheetActivity : BaseCodeActivity
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
        [Description("The 1-based index of the column to convert to a letter (e.g., 1 → A).")]
        public InArgument<int> ColumnIndex { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Column Name")]
        [Description("Returns the column letter corresponding to the given index (e.g., 'A', 'B').")]
        public OutArgument<string> ColumnName { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var columnName = "";
            var status = "Success";

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var columnIndex = ColumnIndex.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (columnIndex < 1)
                    throw new ArgumentException("Column index must be a positive value.", nameof(ColumnIndex));

                // Convert column index to Excel column name
                columnName = GetExcelColumnName(columnIndex);
            }
            catch (Exception ex)
            {
                status = $"Error getting column name: {ex.Message}";
            }

            ColumnName.Set(context, columnName);
            StatusMessage.Set(context, status);
        }

        // Helper method to convert column index to Excel column name
        private static string GetExcelColumnName(int columnIndex)
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