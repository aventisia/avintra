using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Get Selected Cell Range from Excel Worksheet")]
    [Description("Retrieves the currently selected cell range in the provided Excel worksheet as first column, first row, last column, and last row indices.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class GetSelectedCellRangeFromExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The target Excel worksheet instance to get the selected cell range from.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

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
            try
            {
                var worksheet = WorksheetInstance.Get(context);

                if (worksheet == null)
                    throw new InvalidOperationException("Worksheet instance is required but was not provided.");

                // Get parent Excel application
                Excel.Application excelApp = worksheet.Application;
                if (excelApp == null)
                    throw new InvalidOperationException("Excel Application could not be retrieved from the worksheet instance.");

                // Get the currently selected range
                if (!(excelApp.Selection is Excel.Range selectedRange))
                    throw new InvalidOperationException("No cell range is currently selected in Excel.");

                // Extract range boundaries
                var firstCol = selectedRange.Column;
                var firstRow = selectedRange.Row;
                var lastCol = firstCol + selectedRange.Columns.Count - 1;
                var lastRow = firstRow + selectedRange.Rows.Count - 1;

                // Set outputs
                FirstColumnIndex.Set(context, firstCol);
                FirstRowIndex.Set(context, firstRow);
                LastColumnIndex.Set(context, lastCol);
                LastRowIndex.Set(context, lastRow);

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Selected range retrieved successfully: R{firstRow}C{firstCol} to R{lastRow}C{lastCol}");
            }
            catch (Exception ex)
            { 
                FirstColumnIndex.Set(context, null);
                FirstRowIndex.Set(context, null);
                LastColumnIndex.Set(context, null);
                LastRowIndex.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving selected cell range: {ex.Message}");
            }
        }
    }
}