using NodeLibrary.ExcelNodes.Enums;

using NodeLibrary.Office;
namespace NodeLibrary.ExcelNodes;

[DisplayName("Filter Cells in Excel Worksheet"), Description("Applies a filter to a specified range of cells in the provided Excel worksheet.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class FilterCellsInExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet on which to apply the filter.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("Filter Mode"), Description("The filter mode to apply.")]
    public required InArgument<ExcelFilterOperatorEnum> FilterMode { get; set; } = new InArgument<ExcelFilterOperatorEnum>(ExcelFilterOperatorEnum.IsEqualTo);

    [DisplayName("Column"), Description("The column letter or number on which to apply the filter.")]
    public required InArgument<string> Column { get; set; }

    [DisplayName("Start Row"), Description("The starting row of the range to filter.")]
    public InArgument<int> StartRow { get; set; } = new InArgument<int>(1);

    [DisplayName("End Row"), Description("The ending row of the range to filter. If 0, uses the last row with data.")]
    public InArgument<int> EndRow { get; set; } = new InArgument<int>(0);

    [DisplayName("Start Column"), Description("The starting column of the range.")]
    public InArgument<string> StartColumn { get; set; } = new InArgument<string>();

    [DisplayName("End Column"), Description("The ending column of the range.")]
    public InArgument<string> EndColumn { get; set; } = new InArgument<string>();

    [DisplayName("Filter Value"), Description("The value to filter by.")]
    public InArgument<string> FilterValue { get; set; } = new InArgument<string>();

    [DisplayName("Filter Value 2"), Description("The second value for range filters (between two values).")]
    public InArgument<string> FilterValue2 { get; set; } = new InArgument<string>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic? worksheet = WorksheetInstance.Get(context);
            var filterMode = FilterMode.Get(context);
            var columnStr = Column.Get(context) ?? string.Empty;
            var startRow = StartRow.Get(context);
            var endRow = EndRow.Get(context);
            var startColumnStr = StartColumn.Get(context) ?? string.Empty;
            var endColumnStr = EndColumn.Get(context) ?? string.Empty;
            var filterValue = FilterValue.Get(context) ?? string.Empty;
            var filterValue2 = FilterValue2.Get(context) ?? string.Empty;

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            int filterColumn = GetColumnIndex(columnStr);
            int startCol = string.IsNullOrEmpty(startColumnStr) ? 1 : GetColumnIndex(startColumnStr);
            int endCol = string.IsNullOrEmpty(endColumnStr)
                ? worksheet?.UsedRange.Columns.Count ?? 0
                : GetColumnIndex(endColumnStr);

            if (endRow == 0)
                endRow = (worksheet?.UsedRange.Rows.Count ?? 0) + (worksheet?.UsedRange.Row ?? 0) - 1;

            dynamic? range = worksheet?.Range[
                worksheet?.Cells[startRow, startCol],
                worksheet?.Cells[endRow, endCol]];

            int relativeColumn = filterColumn - startCol + 1;

            var xlOperator = OfficeConstants.XlAnd;

            string? criteria1 = filterMode switch
            {
                ExcelFilterOperatorEnum.IsEqualTo => $"={filterValue}",
                ExcelFilterOperatorEnum.DoesNotEqual => $"<>{filterValue}",
                ExcelFilterOperatorEnum.GreaterThan => $">{filterValue}",
                ExcelFilterOperatorEnum.GreaterThanOrEqualTo => $">={filterValue}",
                ExcelFilterOperatorEnum.LessThan => $"<{filterValue}",
                ExcelFilterOperatorEnum.LessThanOrEqualTo => $"<={filterValue}",
                ExcelFilterOperatorEnum.Contains => $"=*{filterValue}*",
                ExcelFilterOperatorEnum.DoesNotContain => $"<>*{filterValue}*",
                ExcelFilterOperatorEnum.IsBetween => $">={filterValue}",
                _ => null
            };

            if (filterMode == ExcelFilterOperatorEnum.ClearFilter)
            {
                if (worksheet?.AutoFilterMode)
                    worksheet?.AutoFilter?.ShowAllData();
            }
            else if (filterMode == ExcelFilterOperatorEnum.IsBetween)
            {
                string criteria2 = $"<={filterValue2}";
                range?.AutoFilter(relativeColumn, criteria1, OfficeConstants.XlAnd, criteria2);
            }
            else
            {
                range?.AutoFilter(relativeColumn, criteria1, xlOperator);
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully applied filter ({filterMode}) on column {columnStr}.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error filtering cells: {ex.Message}");
        }
    }

    private static int GetColumnIndex(string columnName)
    {
        if (string.IsNullOrEmpty(columnName)) return -1;
        if (int.TryParse(columnName, out int num)) return num;
        columnName = columnName.ToUpperInvariant();
        return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
    }
}






