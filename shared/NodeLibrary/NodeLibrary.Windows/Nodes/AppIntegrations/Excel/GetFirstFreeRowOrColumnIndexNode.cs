using NodeLibrary.ExcelNodes.Enums;
using NodeLibrary.ExcelNodes.Helpers;
using NodeLibrary.Office;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Get First Free Row or Column Index"), Description("Gets the first free row or column index based on the search direction in an Excel worksheet.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class GetFirstFreeRowOrColumnIndexNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet to examine.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("Search Direction"), Description("Specifies whether to search for the first free row or the first free column.")]
    public required InArgument<ExcelSearchByEnum> SearchDirection { get; set; } = new InArgument<ExcelSearchByEnum>(ExcelSearchByEnum.Rows);

    [DisplayName("Column"), Description("The column to search in when looking for the first free row. Accepts a column letter (e.g., 'A') or a 1-based index (e.g., '1').")]
    [RenderIfCondition(nameof(SearchDirection), ExcelSearchByEnum.Rows)]
    public InArgument<string> Column { get; set; } = new InArgument<string>("A");

    [DisplayName("Row"), Description("The row to search in when looking for the first free column.")]
    [RenderIfCondition(nameof(SearchDirection), ExcelSearchByEnum.Columns)]
    [NodeFieldType(NodeFieldTypeEnum.Number)]
    public InArgument<int> Row { get; set; } = new InArgument<int>(1);

    [DisplayName("First Free Index"), Description("The index of the first free row or column.")]
    public OutArgument<int> FirstFreeIndex { get; set; } = new OutArgument<int>();

    [DisplayName("First Free Column Name"), Description("The letter name of the first free column when searching by columns; otherwise empty.")]
    [RenderIfCondition(nameof(SearchDirection), ExcelSearchByEnum.Columns)]
    public OutArgument<string> FirstFreeColumnName { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic? worksheet = WorksheetInstance.Get(context);
            var searchDirection = SearchDirection.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            int result;
            string columnName = string.Empty;

            if (searchDirection == ExcelSearchByEnum.Rows)
            {
                var columnStr = Column.Get(context);
                int colIndex = ResolveColumnIndex(columnStr);
                var lastCell = worksheet.Cells[worksheet.Rows.Count, colIndex];
                if (lastCell == null)
                    throw new InvalidOperationException($"Unable to access the last cell in column '{columnStr}'.");

                var firstFree = lastCell.End[OfficeConstants.XlUp];
                if (firstFree == null)
                    throw new InvalidOperationException($"Unable to determine the first free row in column '{columnStr}'.");

                var firstFreeValue = firstFree.Value2;
                result = (firstFree.Row == 1 && firstFreeValue == null) ? 1 : firstFree.Row + 1;
            }
            else
            {
                var row = Row.Get(context);
                ValidateRow(row, nameof(Row));
                var lastCell = worksheet.Cells[row, worksheet.Columns.Count];
                if (lastCell == null)
                    throw new InvalidOperationException($"Unable to access the last cell in row {row}.");

                var firstFree = lastCell.End[OfficeConstants.XlToLeft];
                if (firstFree == null)
                    throw new InvalidOperationException($"Unable to determine the first free column in row {row}.");

                var firstFreeValue = firstFree.Value2;
                result = (firstFree.Column == 1 && firstFreeValue == null) ? 1 : firstFree.Column + 1;
                columnName = ExcelColumnHelper.GetColumnLetter(result);
            }

            FirstFreeIndex.Set(context, result);
            FirstFreeColumnName.Set(context, columnName);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"First free {searchDirection} index: {result}" + (string.IsNullOrEmpty(columnName) ? "." : $" ({columnName})."));
        }
        catch (Exception ex)
        {
            FirstFreeIndex.Set(context, 0);
            FirstFreeColumnName.Set(context, string.Empty);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error: {ex.Message}");
        }
    }

    private static int ResolveColumnIndex(string? column)
    {
        if (string.IsNullOrWhiteSpace(column))
            throw new ArgumentException("Column cannot be empty.", nameof(column));

        column = column.Trim();

        // Accept a numeric index (e.g., "1") or a letter (e.g., "A").
        if (int.TryParse(column, out int numericIndex))
        {
            if (numericIndex < 1)
                throw new ArgumentOutOfRangeException(nameof(column), "Column index must be >= 1.");
            return numericIndex;
        }

        // If the input looks numeric but failed to parse as an integer, give a clearer message.
        if (column.Any(char.IsDigit))
            throw new ArgumentException($"Invalid column '{column}'. Provide a column letter (e.g., 'A') or a whole-number index (e.g., '1').", nameof(column));

        return ExcelColumnHelper.GetColumnIndex(column);
    }

    private static void ValidateRow(int row, string paramName)
    {
        if (row < 1)
            throw new ArgumentOutOfRangeException(paramName, "Row must be >= 1.");
    }
}






