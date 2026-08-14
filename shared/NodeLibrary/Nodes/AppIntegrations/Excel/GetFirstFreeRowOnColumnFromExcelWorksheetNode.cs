
using NodeLibrary.Office;
namespace NodeLibrary.ExcelNodes;

[DisplayName("Get First Free Row on Column from Excel Worksheet"), Description("Gets the first free (empty) row in a specified column of the Excel worksheet.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class GetFirstFreeRowOnColumnFromExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet to examine.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("Column"), Description("The column letter or number to check for the first free row.")]
    public required InArgument<string> Column { get; set; }

    [DisplayName("First Free Row"), Description("The row index of the first empty cell in the specified column.")]
    public OutArgument<int> FirstFreeRow { get; set; } = new OutArgument<int>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic worksheet = WorksheetInstance.Get(context);
            var columnStr = Column.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            int colIndex = int.TryParse(columnStr, out int num) ? num : GetColumnIndex(columnStr);

            if (colIndex < 1)
                throw new ArgumentException($"Invalid column: '{columnStr}'.");

            // Find the last used row in the column, then add 1
            dynamic lastCell = worksheet.Cells[worksheet.Rows.Count, colIndex];
            dynamic firstFreeCell = lastCell.End[OfficeConstants.XlUp];

            int freeRow;
            if (firstFreeCell.Row == 1 && firstFreeCell.Value2 == null)
                freeRow = 1;
            else
                freeRow = firstFreeCell.Row + 1;

            FirstFreeRow.Set(context, freeRow);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"First free row in column '{columnStr}' is row {freeRow}.");
        }
        catch (Exception ex)
        {
            FirstFreeRow.Set(context, 0);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error getting first free row: {ex.Message}");
        }
    }

    private static int GetColumnIndex(string columnName)
    {
        if (string.IsNullOrEmpty(columnName)) return -1;
        columnName = columnName.ToUpperInvariant();
        return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
    }
}






