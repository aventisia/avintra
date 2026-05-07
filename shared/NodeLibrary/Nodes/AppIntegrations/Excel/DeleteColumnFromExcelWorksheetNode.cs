using Excel = Microsoft.Office.Interop.Excel;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Delete Column from Excel Worksheet"), Description("Deletes a specific column from the specified Excel worksheet instance.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class DeleteColumnFromExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet object from which the column will be deleted.")]
    public required InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

    [DisplayName("Column Index"), Description("The index (1-based) or letter (e.g., 'A', 'B') of the column to delete.")]
    public required InArgument<string> ColumnIndex { get; set; }

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var worksheet = WorksheetInstance.Get(context);
            var columnIndexInput = ColumnIndex.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance is null.");

            if (string.IsNullOrWhiteSpace(columnIndexInput))
                throw new ArgumentException("Column index cannot be empty.");

            int columnNumber;
            if (!int.TryParse(columnIndexInput, out columnNumber))
                columnNumber = GetColumnIndex(columnIndexInput);

            if (columnNumber < 1 || columnNumber > worksheet.Columns.Count)
                throw new ArgumentOutOfRangeException(nameof(ColumnIndex), $"Column index must be between 1 and {worksheet.Columns.Count}.");

            ((Excel.Range)worksheet.Columns[columnNumber]).Delete();

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully deleted column {columnIndexInput} (Index: {columnNumber}) from worksheet '{worksheet.Name}'.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error deleting column: {ex.Message}");
        }
    }

    private static int GetColumnIndex(string columnName)
    {
        if (string.IsNullOrWhiteSpace(columnName)) return -1;
        columnName = columnName.Trim().ToUpperInvariant();
        return columnName.Aggregate(0, (acc, c) => acc * 26 + (c - 'A' + 1));
    }
}
