using NodeLibrary.ExcelNodes.Enums;
using Excel = Microsoft.Office.Interop.Excel;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Get First Free Row or Column Row Index"), Description("Gets the first free row or column row index based on the search direction in an Excel worksheet.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class GetFirstFreeRowOrColumnRowIndexNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet to examine.")]
    public required InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

    [DisplayName("Search Direction"), Description("Specifies whether to search for the first free row or the first free column.")]
    public required InArgument<ExcelSearchByEnum> SearchDirection { get; set; }

    [DisplayName("Column"), Description("The column to search in when looking for the first free row.")]
    [RenderIfCondition(nameof(SearchDirection), ExcelSearchByEnum.Rows)]
    public InArgument<string> Column { get; set; } = new InArgument<string>("A");

    [DisplayName("Row"), Description("The row to search in when looking for the first free column.")]
    [RenderIfCondition(nameof(SearchDirection), ExcelSearchByEnum.Columns)]
    public InArgument<int> Row { get; set; } = new InArgument<int>(1);

    [DisplayName("Result Index"), Description("The index of the first free row or column.")]
    public OutArgument<int> ResultIndex { get; set; } = new OutArgument<int>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var worksheet = WorksheetInstance.Get(context);
            var searchDirection = SearchDirection.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            int result;

            if (searchDirection == ExcelSearchByEnum.Rows)
            {
                var columnStr = Column.Get(context);
                int colIndex = int.TryParse(columnStr, out int num) ? num : GetColumnIndex(columnStr);
                var lastCell = (Excel.Range)worksheet.Cells[worksheet.Rows.Count, colIndex];
                var firstFree = lastCell.End[Excel.XlDirection.xlUp];
                result = (firstFree.Row == 1 && firstFree.Value2 == null) ? 1 : firstFree.Row + 1;
            }
            else
            {
                var row = Row.Get(context);
                var lastCell = (Excel.Range)worksheet.Cells[row, worksheet.Columns.Count];
                var firstFree = lastCell.End[Excel.XlDirection.xlToLeft];
                result = (firstFree.Column == 1 && firstFree.Value2 == null) ? 1 : firstFree.Column + 1;
            }

            ResultIndex.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"First free {searchDirection} index: {result}.");
        }
        catch (Exception ex)
        {
            ResultIndex.Set(context, 0);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error: {ex.Message}");
        }
    }

    private static int GetColumnIndex(string columnName)
    {
        if (string.IsNullOrEmpty(columnName)) return -1;
        columnName = columnName.ToUpperInvariant();
        return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
    }
}
