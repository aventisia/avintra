
using NodeLibrary.Office;
namespace NodeLibrary.ExcelNodes;

[DisplayName("Insert Column to Excel Worksheet"), Description("Inserts a new column at the specified position in an Excel worksheet.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class InsertColumnToExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet in which to insert the column.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("Column"), Description("The column letter or index where the new column will be inserted. Existing columns shift to the right.")]
    public required InArgument<string> Column { get; set; }

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic worksheet = WorksheetInstance.Get(context);
            var columnStr = Column.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            if (string.IsNullOrWhiteSpace(columnStr))
                throw new ArgumentException("Column cannot be empty.");

            int colIndex = int.TryParse(columnStr, out int num) ? num : GetColumnIndex(columnStr);

            if (colIndex < 1)
                throw new ArgumentOutOfRangeException(nameof(Column), "Column index must be >= 1.");

            (worksheet.Columns[colIndex]).Insert(OfficeConstants.XlShiftToRight);

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully inserted column at position {columnStr} (Index: {colIndex}).");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error inserting column: {ex.Message}");
        }
    }

    private static int GetColumnIndex(string columnName)
    {
        if (string.IsNullOrEmpty(columnName)) return -1;
        columnName = columnName.ToUpperInvariant();
        return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
    }
}






