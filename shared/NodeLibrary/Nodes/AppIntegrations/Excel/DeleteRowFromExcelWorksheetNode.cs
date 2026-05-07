using Excel = Microsoft.Office.Interop.Excel;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Delete Row from Excel Worksheet"), Description("Deletes a specific row from the specified Excel worksheet instance.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class DeleteRowFromExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet from which the row will be deleted.")]
    public required InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

    [DisplayName("Row Index"), Description("The 1-based index of the row to delete.")]
    public required InArgument<int> RowIndex { get; set; }

    protected override void Execute(INodeContext context)
    {
        try
        {
            var worksheet = WorksheetInstance.Get(context);
            var rowIndex = RowIndex.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            if (rowIndex < 1 || rowIndex > worksheet.Rows.Count)
                throw new ArgumentOutOfRangeException(nameof(RowIndex), $"Row index must be between 1 and {worksheet.Rows.Count}.");

            ((Excel.Range)worksheet.Rows[rowIndex]).Delete();

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully deleted row {rowIndex} from worksheet '{worksheet.Name}'.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error deleting row: {ex.Message}");
        }
    }
}
