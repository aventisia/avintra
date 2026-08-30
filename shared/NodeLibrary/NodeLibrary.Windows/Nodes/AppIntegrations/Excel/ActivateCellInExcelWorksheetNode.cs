using NodeLibrary.ExcelNodes.Enums;
using NodeLibrary.ExcelNodes.Helpers;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Activate Cell in Excel Worksheet"), Description("Activates a specific cell in the given worksheet based on absolute position, relative offset, or named range.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class ActivateCellInExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The specific worksheet where the cell should be activated.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("Activation Mode"), Description("Choose how to activate the cell: absolutely, relatively, or via named range.")]
    public required InArgument<ActivationModeEnum> ActivationMode { get; set; } = new InArgument<ActivationModeEnum>(ActivationModeEnum.Absolute);

    [DisplayName("Column"), Description("The column letter (e.g., 'A', 'B') or number of the target cell.")]
    [RenderIfCondition(nameof(ActivationMode), ActivationModeEnum.Absolute)]
    public InArgument<string> Column { get; set; } = new InArgument<string>();

    [DisplayName("Row"), Description("The row number of the target cell.")]
    [RenderIfCondition(nameof(ActivationMode), ActivationModeEnum.Absolute)]
    public InArgument<int> Row { get; set; } = new InArgument<int>();

    [DisplayName("Name"), Description("The name of the named range or cell to activate.")]
    [RenderIfCondition(nameof(ActivationMode), ActivationModeEnum.NamedRange)]
    public InArgument<string> Name { get; set; } = new InArgument<string>();

    [DisplayName("Direction"), Description("The direction to move from the currently active cell when activating relatively.")]
    [RenderIfCondition(nameof(ActivationMode), ActivationModeEnum.Relative)]
    public InArgument<CellMoveDirectionEnum> Direction { get; set; } = new InArgument<CellMoveDirectionEnum>(CellMoveDirectionEnum.Down);

    [DisplayName("Offset From Active Cell"), Description("Number of cells to move from the current active cell when activating relatively.")]
    [RenderIfCondition(nameof(ActivationMode), ActivationModeEnum.Relative)]
    public InArgument<int> OffsetFromActiveCell { get; set; } = new InArgument<int>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            dynamic? worksheet = WorksheetInstance.Get(context);
            var activationMode = ActivationMode.Get(context);

            if (worksheet == null)
            {
                dynamic? excelApp = ComHelper.GetActiveObject("Excel.Application");
                worksheet = excelApp?.ActiveSheet;
            }

            if (worksheet == null)
                throw new InvalidOperationException("No active worksheet found to perform cell activation.");

            switch (activationMode)
            {
                case ActivationModeEnum.Absolute:
                    var row = Row.Get(context);
                    var colStr = Column.Get(context) ?? string.Empty;

                    if (string.IsNullOrWhiteSpace(colStr))
                        throw new ArgumentException("Column must be provided for absolute activation.");

                    if (!int.TryParse(colStr, out var colNum))
                        colNum = GetColumnIndex(colStr);

                    (worksheet.Cells[row, colNum]).Activate();
                    status = $"Activated cell at Row {row}, Column {colStr}.";
                    break;

                case ActivationModeEnum.Relative:
                    var direction = Direction.Get(context);
                    var offset = OffsetFromActiveCell.Get(context);

                    var activeCell = worksheet.Application.ActiveCell;
                    if (activeCell == null)
                        throw new InvalidOperationException("No active cell found to move relative from.");

                    dynamic? targetCell = direction switch
                    {
                        CellMoveDirectionEnum.Up => activeCell.Offset[-offset, 0],
                        CellMoveDirectionEnum.Down => activeCell.Offset[offset, 0],
                        CellMoveDirectionEnum.Left => activeCell.Offset[0, -offset],
                        CellMoveDirectionEnum.Right => activeCell.Offset[0, offset],
                        _ => null
                    };

                    targetCell?.Select();
                    status = $"Activated cell {offset} cells {direction} from active cell.";
                    break;

                case ActivationModeEnum.NamedRange:
                    var name = Name.Get(context) ?? string.Empty;
                    if (string.IsNullOrWhiteSpace(name))
                        throw new ArgumentException("Named range name cannot be empty.");

                    var range = worksheet.Range[name];
                    if (range == null)
                        throw new ArgumentException($"Named range '{name}' not found.");

                    range.Select();
                    status = $"Activated named range '{name}'.";
                    break;

                default:
                    throw new ArgumentOutOfRangeException(nameof(activationMode));
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error activating cell: {ex.Message}");
        }
    }

    private static int GetColumnIndex(string columnName)
    {
        if (string.IsNullOrEmpty(columnName))
            throw new ArgumentException("Column name cannot be null or empty.");

        columnName = columnName.ToUpperInvariant();
        return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
    }
}





