using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Runtime.InteropServices;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Filter Cells in Excel Worksheet")]
    [Description("Filters cells in the active Excel worksheet based on criteria applied to a specific column.")]
    public class FilterCellsInExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [DisplayName("Filter Mode")]
        [Description("Specifies how to filter cells: Active Sheet, Specific Range, Named Cells, or Table.")]
        [DefaultValue(ExcellFilterModeEnum.ActiveSheet)]
        public InArgument<ExcellFilterModeEnum> FilterMode { get; set; }


        [DisplayName("Start Column")]
        [Description("The starting column of the range to filter (required if 'Filter Mode' is 'Specific Range').")]
        [RenderIfCondition(nameof(FilterMode), ExcellFilterModeEnum.SpecificRange)]
        public InArgument<string> StartColumn { get; set; }


        [DisplayName("End Column")]
        [Description("The ending column of the range to filter (required if 'Filter Mode' is 'Specific Range').")]
        [RenderIfCondition(nameof(FilterMode), ExcellFilterModeEnum.SpecificRange)]
        public InArgument<string> EndColumn { get; set; }


        [DisplayName("Start Row")]
        [Description("The starting row of the range to filter (required if 'Filter Mode' is 'Specific Range').")]
        [RenderIfCondition(nameof(FilterMode), ExcellFilterModeEnum.SpecificRange)]
        public InArgument<int> StartRow { get; set; }


        [DisplayName("End Row")]
        [Description("The ending row of the range to filter (required if 'Filter Mode' is 'Specific Range').")]
        [RenderIfCondition(nameof(FilterMode), ExcellFilterModeEnum.SpecificRange)]
        public InArgument<int> EndRow { get; set; }


        [DisplayName("Named Cells")]
        [Description("The name of the named range to filter (required if 'Filter Mode' is 'NamedCells').")]
        [RenderIfCondition(nameof(FilterMode), ExcellFilterModeEnum.NamedCells)]
        public InArgument<string> NamedCells { get; set; }


        [DisplayName("Table Name")]
        [Description("The name of the table to filter (required if 'Filter Mode' is 'Table').")]
        [RenderIfCondition(nameof(FilterMode), ExcellFilterModeEnum.Table)]
        public InArgument<string> TableName { get; set; }

        [RequiredArgument]
        [DisplayName("Column To Filter")]
        [Description("The column letter (e.g., 'A', 'B') or number (e.g., 1, 2) to apply the filter on.")]
        public InArgument<string> ColumnToFilter { get; set; }

        [RequiredArgument]
        [DisplayName("Filter Criteria")]
        [Description("The filter condition to apply. Example: '=Apple', '>10', '<>Complete'.")]
        public InArgument<string> FilterCriteria { get; set; }

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
                var filterMode = FilterMode.Get(context);
                var columnToFilter = ColumnToFilter.Get(context);
                var filterCriteria = FilterCriteria.Get(context);

                if (!(excelApp?.ActiveWorkbook?.ActiveSheet is Excel.Worksheet worksheet))
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet ws))
                    throw new InvalidOperationException("Active sheet is not a valid Excel worksheet.");

                switch (filterMode)
                {
                    case ExcellFilterModeEnum.ActiveSheet:
                        {
                            var usedRange = ws.UsedRange;
                            ApplyFilter(ws, usedRange, columnToFilter, filterCriteria);
                            break;
                        }

                    case ExcellFilterModeEnum.SpecificRange:
                        {
                            var startColStr = StartColumn.Get(context);
                            var endColStr = EndColumn.Get(context);
                            var startRow = StartRow.Get(context);
                            var endRow = EndRow.Get(context);

                            int startColNum, endColNum;

                            if (!int.TryParse(startColStr, out startColNum))
                                startColNum = GetColumnIndex(ws, columnToFilter);

                            if (!int.TryParse(endColStr, out endColNum)) endColNum = GetColumnIndex(ws, columnToFilter);

                            var range = ws.Range[ws.Cells[startRow, startColNum], ws.Cells[endRow, endColNum]];
                            ApplyFilter(ws, range, columnToFilter, filterCriteria);
                            break;
                        }

                    case ExcellFilterModeEnum.NamedCells:
                        {
                            var namedRangeName = NamedCells.Get(context);
                            var namedRange = ws.Names.Item(namedRangeName)?.RefersToRange;

                            if (namedRange == null)
                                throw new ArgumentException($"Named range '{namedRangeName}' not found.");

                            ApplyFilter(ws, namedRange, columnToFilter, filterCriteria);
                            break;
                        }

                    case ExcellFilterModeEnum.Table:
                        {
                            var tableName = TableName.Get(context);
                            var table = ws.ListObjects[tableName];

                            if (table == null)
                                throw new ArgumentException($"Table '{tableName}' not found.");

                            ApplyFilter(ws, table.Range, columnToFilter, filterCriteria);
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(filterMode));
                }

                status = $"Successfully applied filter on column '{columnToFilter}' with criteria '{filterCriteria}'.";
            }
            catch (Exception ex)
            {
                status = $"Error applying filter: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        private void ApplyFilter(Excel.Worksheet ws, Excel.Range range, string columnToFilter, string filterCriteria)
        {
            if (ws.AutoFilterMode)
                ws.AutoFilterMode = false;

            var fieldIndex = GetColumnIndex(ws, columnToFilter);

            if (fieldIndex < 1 || fieldIndex > range.Columns.Count)
                throw new ArgumentException($"Column '{columnToFilter}' not found in the specified range.");

            range.AutoFilter(fieldIndex, filterCriteria);
        }

        // Helper method to convert column letter (e.g., A, B) to index
        private static int GetColumnIndex(Excel.Worksheet worksheet, string columnRef)
        {
            if (int.TryParse(columnRef, out var index))
                return index;

            var range = worksheet.Range[columnRef + "1"];
            if (range == null) return -1;
            index = range.Column;
            Marshal.ReleaseComObject(range);
            return index;
        }
    }
}