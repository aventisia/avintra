
namespace NodeLibrary.ExcelNodes;

[DisplayName("Get First Free Column/Row from Excel Worksheet"), Description("Gets the first free column and row in the used range of the specified Excel worksheet.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class GetFirstFreeColumnRowFromExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet to examine for the first free column and row.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("First Free Column"), Description("The first free (empty) column index after the used range.")]
    public OutArgument<int> FirstFreeColumn { get; set; } = new OutArgument<int>();

    [DisplayName("First Free Column Name"), Description("The letter name of the first free column.")]
    public OutArgument<string> FirstFreeColumnName { get; set; } = new OutArgument<string>();

    [DisplayName("First Free Row"), Description("The first free (empty) row index after the used range.")]
    public OutArgument<int> FirstFreeRow { get; set; } = new OutArgument<int>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic worksheet = WorksheetInstance.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            var usedRange = worksheet.UsedRange;
            int lastRow = usedRange.Row + usedRange.Rows.Count;
            int lastCol = usedRange.Column + usedRange.Columns.Count;

            FirstFreeRow.Set(context, lastRow);
            FirstFreeColumn.Set(context, lastCol);
            FirstFreeColumnName.Set(context, GetColumnLetter(lastCol));

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"First free row: {lastRow}, First free column: {lastCol} ({GetColumnLetter(lastCol)}).");
        }
        catch (Exception ex)
        {
            FirstFreeColumn.Set(context, 0);
            FirstFreeColumnName.Set(context, string.Empty);
            FirstFreeRow.Set(context, 0);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error getting first free column/row: {ex.Message}");
        }
    }

    private static string GetColumnLetter(int columnNumber)
    {
        string result = string.Empty;
        while (columnNumber > 0)
        {
            columnNumber--;
            result = (char)('A' + columnNumber % 26) + result;
            columnNumber /= 26;
        }
        return result;
    }
}





