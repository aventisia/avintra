using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Get Selected Cell Range from Excel Worksheet")]
    [Description(
        "Retrieves the currently selected cell range in the active Excel worksheet as first column, first row, last column, and last row indices.")]
    public class GetSelectedCellRangeFromExcelWorksheetActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("First Column Index")]
        [Description("Returns the column index (1-based) of the first cell in the selected range.")]
        public OutArgument<int> FirstColumnIndex { get; set; }


        [DisplayName("First Row Index")]
        [Description("Returns the row index (1-based) of the first cell in the selected range.")]
        public OutArgument<int> FirstRowIndex { get; set; }


        [DisplayName("Last Column Index")]
        [Description("Returns the column index (1-based) of the last cell in the selected range.")]
        public OutArgument<int> LastColumnIndex { get; set; }


        [DisplayName("Last Row Index")]
        [Description("Returns the row index (1-based) of the last cell in the selected range.")]
        public OutArgument<int> LastRowIndex { get; set; }

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

                if (!(excelApp.Selection is Excel.Range selectedRange))
                    throw new InvalidOperationException("No range selected in Excel.");

                // Extract range bounds
                var firstCol = selectedRange.Column;
                var firstRow = selectedRange.Row;
                var lastCol = selectedRange.Columns.Count + firstCol - 1;
                var lastRow = selectedRange.Rows.Count + firstRow - 1;

                FirstColumnIndex.Set(context, firstCol);
                FirstRowIndex.Set(context, firstRow);
                LastColumnIndex.Set(context, lastCol);
                LastRowIndex.Set(context, lastRow);
            }
            catch (Exception ex)
            {
                status = $"Error retrieving selected cell range: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}