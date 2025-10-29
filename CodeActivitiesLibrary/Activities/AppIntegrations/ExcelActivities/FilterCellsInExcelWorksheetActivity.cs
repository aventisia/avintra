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
    [Description("Filters cells in the specified Excel worksheet based on criteria applied to a specific column.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class FilterCellsInExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The Excel Worksheet object to apply the filter on.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

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
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var worksheet = WorksheetInstance.Get(context);
                var filterMode = FilterMode.Get(context);
                var columnToFilter = ColumnToFilter.Get(context);
                var filterCriteria = FilterCriteria.Get(context);

                if (worksheet == null)
                    throw new InvalidOperationException("Worksheet instance is null.");

                switch (filterMode)
                {
                    case ExcellFilterModeEnum.ActiveSheet:
                        {
                            var usedRange = worksheet.UsedRange;
                            ApplyFilter(worksheet, usedRange, columnToFilter, filterCriteria);
                            break;
                        }

                    case ExcellFilterModeEnum.SpecificRange:
                        {
                            var startColStr = StartColumn.Get(context);
                            var endColStr = EndColumn.Get(context);
                            var startRow = StartRow.Get(context);
                            var endRow = EndRow.Get(context);

                            int startColNum = GetColumnIndex(worksheet, startColStr);
                            int endColNum = GetColumnIndex(worksheet, endColStr);

                            var range = worksheet.Range[worksheet.Cells[startRow, startColNum], worksheet.Cells[endRow, endColNum]];
                            ApplyFilter(worksheet, range, columnToFilter, filterCriteria);
                            break;
                        }

                    case ExcellFilterModeEnum.NamedCells:
                        {
                            var namedRangeName = NamedCells.Get(context);
                            var namedRange = worksheet.Names.Item(namedRangeName)?.RefersToRange;

                            if (namedRange == null)
                                throw new ArgumentException($"Named range '{namedRangeName}' not found.");

                            ApplyFilter(worksheet, namedRange, columnToFilter, filterCriteria);
                            break;
                        }

                    case ExcellFilterModeEnum.Table:
                        {
                            var tableName = TableName.Get(context);
                            var table = worksheet.ListObjects[tableName];

                            if (table == null)
                                throw new ArgumentException($"Table '{tableName}' not found.");

                            ApplyFilter(worksheet, table.Range, columnToFilter, filterCriteria);
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(filterMode));
                }

                status = $"Successfully applied filter on column '{columnToFilter}' with criteria '{filterCriteria}'.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error applying filter: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
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

        // Helper: Convert column letter (A, B, etc.) to index
        private static int GetColumnIndex(Excel.Worksheet worksheet, string columnRef)
        {
            if (string.IsNullOrWhiteSpace(columnRef))
                throw new ArgumentException("Column reference cannot be null or empty.");

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