
using NodeLibrary.ExcelNodes.Helpers;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Get Active Cell on Excel Worksheet"), Description("Retrieves the address and value of the currently active cell in the specified Excel worksheet.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class GetActiveCellOnExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet from which to get the active cell.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("Active Cell Column"), Description("The column letter of the active cell.")]
    public OutArgument<string> ActiveCellColumn { get; set; } = new OutArgument<string>();

    [DisplayName("Active Cell Row"), Description("The row number of the active cell.")]
    public OutArgument<int> ActiveCellRow { get; set; } = new OutArgument<int>();

    [DisplayName("Active Cell Value"), Description("The value of the active cell.")]
    public OutArgument<string> ActiveCellValue { get; set; } = new OutArgument<string>();

    [DisplayName("Active Cell Address"), Description("The full address of the active cell (e.g., '$A$1').")]
    public OutArgument<string> ActiveCellAddress { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic? worksheet = WorksheetInstance.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            var activeCell = worksheet.Application.ActiveCell;

            if (activeCell == null)
                throw new InvalidOperationException("No active cell found.");

            ActiveCellColumn.Set(context, ExcelColumnHelper.GetColumnLetter(activeCell.Column));
            ActiveCellRow.Set(context, activeCell.Row);
            ActiveCellValue.Set(context, activeCell.Value2?.ToString() ?? string.Empty);
            ActiveCellAddress.Set(context, activeCell.Address);

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Active cell is at {activeCell.Address}.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error getting active cell: {ex.Message}");
        }
    }
}





