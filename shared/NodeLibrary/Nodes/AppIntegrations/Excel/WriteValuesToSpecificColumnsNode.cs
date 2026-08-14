
namespace NodeLibrary.ExcelNodes;

[DisplayName("Write Values to Specific Columns"), Description("Writes values to specific columns in a row of an Excel worksheet, useful for populating multiple columns at once.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class WriteValuesToSpecificColumnsNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet where the values will be written.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("Row"), Description("The row number where the values will be written.")]
    public required InArgument<int> Row { get; set; }

    [DisplayName("Column-Value Pairs"), Description("A dictionary mapping column letters/numbers to the values to write (e.g., { \"A\": \"Hello\", \"B\": \"World\" }).")]
    public required InArgument<Dictionary<string, string>> ColumnValuePairs { get; set; }

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic worksheet = WorksheetInstance.Get(context);
            var row = Row.Get(context);
            var columnValuePairs = ColumnValuePairs.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            if (columnValuePairs == null || columnValuePairs.Count == 0)
                throw new ArgumentException("Column-Value pairs cannot be null or empty.");

            if (row < 1)
                throw new ArgumentOutOfRangeException(nameof(Row), "Row must be >= 1.");

            int writtenCount = 0;
            foreach (var kvp in columnValuePairs)
            {
                int colIndex = int.TryParse(kvp.Key, out int num) ? num : GetColumnIndex(kvp.Key);
                if (colIndex < 1)
                    throw new ArgumentException($"Invalid column: '{kvp.Key}'.");

                (worksheet.Cells[row, colIndex]).Value2 = kvp.Value;
                writtenCount++;
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully wrote {writtenCount} value(s) to row {row}.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error writing values: {ex.Message}");
        }
    }

    private static int GetColumnIndex(string columnName)
    {
        if (string.IsNullOrEmpty(columnName)) return -1;
        columnName = columnName.ToUpperInvariant();
        return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
    }
}





