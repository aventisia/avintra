using Excel = Microsoft.Office.Interop.Excel;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Lookup Range in Excel Worksheet"), Description("Looks up a value in a specified range and returns the corresponding value from another column or the cell address.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class LookupRangeInExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet in which to perform the lookup.")]
    public required InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

    [DisplayName("Lookup Value"), Description("The value to look for in the search column.")]
    public required InArgument<string> LookupValue { get; set; }

    [DisplayName("Search Column"), Description("The column letter or number to search in.")]
    public required InArgument<string> SearchColumn { get; set; }

    [DisplayName("Start Row"), Description("The starting row of the range to search.")]
    public InArgument<int> StartRow { get; set; } = new InArgument<int>(1);

    [DisplayName("End Row"), Description("The ending row of the range to search. If 0, uses the last row with data.")]
    public InArgument<int> EndRow { get; set; } = new InArgument<int>(0);

    [DisplayName("Result Column"), Description("The column from which to return the result value. If empty, returns the found cell address.")]
    public InArgument<string> ResultColumn { get; set; } = new InArgument<string>();

    [DisplayName("Match Case"), Description("Whether the lookup should be case-sensitive.")]
    public InArgument<bool> MatchCase { get; set; } = new InArgument<bool>(false);

    [DisplayName("Found Value"), Description("The value found in the result column corresponding to the lookup value.")]
    public OutArgument<string> FoundValue { get; set; } = new OutArgument<string>();

    [DisplayName("Found Row"), Description("The row number where the lookup value was found.")]
    public OutArgument<int> FoundRow { get; set; } = new OutArgument<int>();

    [DisplayName("Found Cell Address"), Description("The cell address where the lookup value was found.")]
    public OutArgument<string> FoundCellAddress { get; set; } = new OutArgument<string>();

    [DisplayName("Value Found"), Description("Indicates whether the lookup value was found.")]
    public OutArgument<bool> ValueFound { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var worksheet = WorksheetInstance.Get(context);
            var lookupValue = LookupValue.Get(context);
            var searchColumnStr = SearchColumn.Get(context);
            var startRow = StartRow.Get(context);
            var endRow = EndRow.Get(context);
            var resultColumnStr = ResultColumn.Get(context);
            var matchCase = MatchCase.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            int searchCol = int.TryParse(searchColumnStr, out int sNum) ? sNum : GetColumnIndex(searchColumnStr);

            if (endRow == 0)
            {
                var lastCell = (Excel.Range)worksheet.Cells[worksheet.Rows.Count, searchCol];
                endRow = lastCell.End[Excel.XlDirection.xlUp].Row;
            }

            var searchRange = worksheet.Range[worksheet.Cells[startRow, searchCol], worksheet.Cells[endRow, searchCol]];

            Excel.Range found = searchRange.Find(
                What: lookupValue,
                LookAt: Excel.XlLookAt.xlWhole,
                MatchCase: matchCase);

            if (found != null)
            {
                ValueFound.Set(context, true);
                FoundRow.Set(context, found.Row);
                FoundCellAddress.Set(context, found.Address);

                if (!string.IsNullOrEmpty(resultColumnStr))
                {
                    int resultCol = int.TryParse(resultColumnStr, out int rNum) ? rNum : GetColumnIndex(resultColumnStr);
                    var resultCell = (Excel.Range)worksheet.Cells[found.Row, resultCol];
                    FoundValue.Set(context, resultCell.Value2?.ToString() ?? string.Empty);
                }
                else
                {
                    FoundValue.Set(context, found.Value2?.ToString() ?? string.Empty);
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Found '{lookupValue}' at {found.Address}.");
            }
            else
            {
                ValueFound.Set(context, false);
                FoundRow.Set(context, 0);
                FoundCellAddress.Set(context, string.Empty);
                FoundValue.Set(context, string.Empty);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Value '{lookupValue}' not found in the specified range.");
            }
        }
        catch (Exception ex)
        {
            ValueFound.Set(context, false);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error during lookup: {ex.Message}");
        }
    }

    private static int GetColumnIndex(string columnName)
    {
        if (string.IsNullOrEmpty(columnName)) return -1;
        columnName = columnName.ToUpperInvariant();
        return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
    }
}
