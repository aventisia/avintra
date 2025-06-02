using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using CodeActivitiesLibrary.Extensions;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Lookup Range in Excel Worksheet")]
    [Description(
        "Performs a LOOKUP operation in an Excel worksheet. Searches for a lookup value in a single row or column and returns a value from the same position in another row or column.")]
    public class LookupRangeInExcelWorksheetActivity : Extensions.BaseCodeActivity
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
        [DisplayName("Lookup Value")]
        [Description("The value to search for in the lookup range.")]
        public InArgument<string> LookupValue { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Ranges Format")]
        [Description("Specifies how the ranges are defined: Named Cells or Specific Ranges.")]
        [DefaultValue(ExcelLookupRangesFormatEnum.NamedCells)]
        public InArgument<ExcelLookupRangesFormatEnum> RangesFormat { get; set; }

        [Category("Input")]
        [DisplayName("Cells Name")]
        [Description("The name of the named range to use for lookup (required if 'Ranges Format' is 'Named Cells').")]
        [RenderIfCondition(nameof(RangesFormat), "NamedCells")]
        public InArgument<string> CellsName { get; set; }

        [Category("Input")]
        [DisplayName("Start Column")]
        [Description("The starting column of the lookup range (required if 'Ranges Format' is 'Specific Ranges').")]
        [RenderIfCondition(nameof(RangesFormat), "SpecificRanges")]
        public InArgument<string> StartColumn { get; set; }

        [Category("Input")]
        [DisplayName("Start Row")]
        [Description("The starting row of the lookup range (required if 'Ranges Format' is 'Specific Ranges').")]
        [RenderIfCondition(nameof(RangesFormat), "SpecificRanges")]
        public InArgument<int> StartRow { get; set; }

        [Category("Input")]
        [DisplayName("End Column")]
        [Description("The ending column of the lookup range (required if 'Ranges Format' is 'Specific Ranges').")]
        [RenderIfCondition(nameof(RangesFormat), "SpecificRanges")]
        public InArgument<string> EndColumn { get; set; }

        [Category("Input")]
        [DisplayName("End Row")]
        [Description("The ending row of the lookup range (required if 'Ranges Format' is 'Specific Ranges').")]
        [RenderIfCondition(nameof(RangesFormat), "SpecificRanges")]
        public InArgument<int> EndRow { get; set; }

        [Category("Input")]
        [DisplayName("Array Form")]
        [Description("If true, performs array-based lookup; otherwise, performs scalar lookup.")]
        public InArgument<bool> ArrayForm { get; set; }

        [Category("Input")]
        [DisplayName("Start Column of Results Source")]
        [Description("The starting column of the result range (required if 'Array Form' is false).")]
        [RenderIfCondition(nameof(ArrayForm), "false")]
        public InArgument<string> StartColumnOfResultsSource { get; set; }

        [Category("Input")]
        [DisplayName("Start Row of Results Source")]
        [Description("The starting row of the result range (required if 'Array Form' is false).")]
        [RenderIfCondition(nameof(ArrayForm), "false")]
        public InArgument<int> StartRowOfResultsSource { get; set; }

        [Category("Input")]
        [DisplayName("End Column of Results Source")]
        [Description("The ending column of the result range (required if 'Array Form' is false).")]
        [RenderIfCondition(nameof(ArrayForm), "false")]
        public InArgument<string> EndColumnOfResultsSource { get; set; }

        [Category("Input")]
        [DisplayName("End Row of Results Source")]
        [Description("The ending row of the result range (required if 'Array Form' is false).")]
        [RenderIfCondition(nameof(ArrayForm), "false")]
        public InArgument<int> EndRowOfResultsSource { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
        [DisplayName("Lookup Result")]
        [Description("Returns the matched result from the result range based on the lookup value.")]
        public OutArgument<string> LookupResult { get; set; }

        [Category("Output")] 

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var result = "";
            var status = "Success";

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var lookupValue = LookupValue.Get(context);
                var rangesFormat = RangesFormat.Get(context);
                var arrayForm = ArrayForm.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet ws))
                    throw new InvalidOperationException("Active sheet is not a valid Excel worksheet.");

                Excel.Range lookupRange = null;
                Excel.Range resultRange = null;

                switch (rangesFormat)
                {
                    case ExcelLookupRangesFormatEnum.NamedCells:
                        {
                            var cellsName = CellsName.Get(context);

                            if (string.IsNullOrWhiteSpace(cellsName))
                                throw new ArgumentException("Cells name cannot be empty when using 'Named Cells' format.");

                            lookupRange = ws.Range[cellsName];
                            resultRange = ws.Range[cellsName]; // Assuming same range for simplicity
                            break;
                        }

                    case ExcelLookupRangesFormatEnum.SpecificRanges:
                        {
                            var startCol = StartColumn.Get(context);
                            var startRow = StartRow.Get(context);
                            var endCol = EndColumn.Get(context);
                            var endRow = EndRow.Get(context);

                            if (string.IsNullOrWhiteSpace(startCol) || string.IsNullOrWhiteSpace(endCol))
                                throw new ArgumentException(
                                    "Start column and end column cannot be empty when using 'Specific Ranges' format.");

                            lookupRange = ws.Range[ws.Cells[startRow, GetColumnIndex(startCol)],
                                ws.Cells[endRow, GetColumnIndex(endCol)]];

                            if (!arrayForm)
                            {
                                var startColRes = StartColumnOfResultsSource.Get(context);
                                var startRowRes = StartRowOfResultsSource.Get(context);
                                var endColRes = EndColumnOfResultsSource.Get(context);
                                var endRowRes = EndRowOfResultsSource.Get(context);

                                if (string.IsNullOrWhiteSpace(startColRes) || string.IsNullOrWhiteSpace(endColRes))
                                    throw new ArgumentException(
                                        "Start column and end column of results source cannot be empty when 'Array Form' is false.");

                                resultRange = ws.Range[ws.Cells[startRowRes, GetColumnIndex(startColRes)],
                                    ws.Cells[endRowRes, GetColumnIndex(endColRes)]];
                            }
                            else
                            {
                                resultRange = lookupRange; // For array form, result range is the same as lookup range
                            }

                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(rangesFormat));
                }

                if (lookupRange == null || resultRange == null)
                    throw new InvalidOperationException("Lookup range or result range could not be retrieved.");

                // Perform lookup
                var lookupResult = excelApp.WorksheetFunction.Lookup(lookupValue, lookupRange, resultRange);

                result = lookupResult?.ToString() ?? "";
            }
            catch (Exception ex)
            {
                status = $"Error performing lookup: {ex.Message}";
                result = "";
            }

            LookupResult.Set(context, result);
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