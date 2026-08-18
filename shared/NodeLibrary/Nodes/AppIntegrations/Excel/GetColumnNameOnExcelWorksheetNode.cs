
using NodeLibrary.ExcelNodes.Helpers;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Get Column Name on Excel Worksheet"), Description("Gets the column letter name for a given column index in the specified Excel worksheet.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class GetColumnNameOnExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet instance.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("Column Index"), Description("The 1-based column index to convert to a column letter name.")]
    public required InArgument<int> ColumnIndex { get; set; }

    [DisplayName("Column Name"), Description("The letter name of the column (e.g., 'A', 'B', 'AA').")]
    public OutArgument<string> ColumnName { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic worksheet = WorksheetInstance.Get(context);
            var columnIndex = ColumnIndex.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            if (columnIndex < 1)
                throw new ArgumentOutOfRangeException(nameof(ColumnIndex), "Column index must be >= 1.");

            string columnName = ExcelColumnHelper.GetColumnLetter(columnIndex);

            ColumnName.Set(context, columnName);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Column index {columnIndex} corresponds to column '{columnName}'.");
        }
        catch (Exception ex)
        {
            ColumnName.Set(context, string.Empty);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error getting column name: {ex.Message}");
        }
    }
}





