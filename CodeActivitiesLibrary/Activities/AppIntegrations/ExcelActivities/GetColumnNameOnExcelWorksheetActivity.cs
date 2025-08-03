using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Get Column Name on Excel Worksheet")]
    [Description("Gets the name of a column by reading the first non-empty cell in the specified column.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/Excel.svg")]
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
        [Description("The 1-based index of the column to retrieve the name from (e.g., 1 → first column).")]
        public InArgument<int> ColumnIndex { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("Column Name")]
        [Description("Returns the name of the column found in the first non-empty cell of the specified column.")]
        public OutArgument<string> ColumnName { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var excelApp = ExcelApplication.Get(context);
                var columnIndex = ColumnIndex.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (columnIndex < 1)
                    throw new ArgumentException("Column index must be a positive value.", nameof(ColumnIndex));

                Excel.Worksheet activeSheet = excelApp.ActiveSheet;

                string columnName = null;
                int maxRowsToCheck = 100; // You can adjust this limit if needed

                for (int row = 1; row <= maxRowsToCheck; row++)
                {
                    Excel.Range cell = activeSheet.Cells[row, columnIndex] as Excel.Range;
                    var value = cell?.Value2?.ToString().Trim();

                    if (!string.IsNullOrEmpty(value))
                    {
                        columnName = value;
                        break;
                    }
                }

                if (columnName == null)
                {
                    StatusMessage.Set(context, "No non-empty cell found in the column.");
                }

                ColumnName.Set(context, columnName);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Retrieved column name: {columnName ?? "[None found]"}");
            }
            catch (Exception ex)
            {
                ColumnName.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error getting column name: {ex.Message}");
            }
        }
    }
}