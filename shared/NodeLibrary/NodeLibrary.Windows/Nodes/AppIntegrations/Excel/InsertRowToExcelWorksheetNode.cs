
using NodeLibrary.Office;
namespace NodeLibrary.ExcelNodes;

[DisplayName("Insert Row to Excel Worksheet"), Description("Inserts a new row at the specified position in an Excel worksheet.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class InsertRowToExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet in which to insert the row.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("Row Index"), Description("The row number where the new row will be inserted. Existing rows shift down.")]
    public required InArgument<int> RowIndex { get; set; }

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic? worksheet = WorksheetInstance.Get(context);
            var rowIndex = RowIndex.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            if (rowIndex < 1)
                throw new ArgumentOutOfRangeException(nameof(RowIndex), "Row index must be >= 1.");

            (worksheet.Rows[rowIndex]).Insert(OfficeConstants.XlShiftDown);

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully inserted row at position {rowIndex}.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error inserting row: {ex.Message}");
        }
    }
}






