using NodeLibrary.ExcelNodes.Enums;
using NodeLibrary.ExcelNodes.Helpers;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Clear Cells in Excel Worksheet"), Description("Clears a specified range or named cell in the provided worksheet or workbook.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class ClearCellsInExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The specific worksheet instance to clear cells from.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("Clear Mode"), Description("Specifies how to clear cells: Single Cell, Named Cells, Range of Cells, or Relative to Active Cell.")]
    public required InArgument<CellClearModeEnum> ClearMode { get; set; }

    [DisplayName("Column"), Description("The column letter or number of the target cell.")]
    [RenderIfCondition(nameof(ClearMode), CellClearModeEnum.SingleCell)]
    public InArgument<string> Column { get; set; } = new InArgument<string>();

    [DisplayName("Row"), Description("The row number of the target cell.")]
    [RenderIfCondition(nameof(ClearMode), CellClearModeEnum.SingleCell)]
    public InArgument<int> Row { get; set; } = new InArgument<int>();

    [DisplayName("Name"), Description("The name of the named range or cell to clear.")]
    [RenderIfCondition(nameof(ClearMode), CellClearModeEnum.NamedCells)]
    public InArgument<string> Name { get; set; } = new InArgument<string>();

    [DisplayName("Start Column"), Description("The starting column of the range to clear.")]
    [RenderIfCondition(nameof(ClearMode), CellClearModeEnum.RangeOfCells)]
    public InArgument<string> StartColumn { get; set; } = new InArgument<string>();

    [DisplayName("End Column"), Description("The ending column of the range to clear.")]
    [RenderIfCondition(nameof(ClearMode), CellClearModeEnum.RangeOfCells)]
    public InArgument<string> EndColumn { get; set; } = new InArgument<string>();

    [DisplayName("Start Row"), Description("The starting row of the range to clear.")]
    [RenderIfCondition(nameof(ClearMode), CellClearModeEnum.RangeOfCells)]
    public InArgument<int> StartRow { get; set; } = new InArgument<int>();

    [DisplayName("End Row"), Description("The ending row of the range to clear.")]
    [RenderIfCondition(nameof(ClearMode), CellClearModeEnum.RangeOfCells)]
    public InArgument<int> EndRow { get; set; } = new InArgument<int>();

    [DisplayName("X-Axis Direction"), Description("The direction to move horizontally from the currently active cell.")]
    [RenderIfCondition(nameof(ClearMode), CellClearModeEnum.RangeRelativeToActiveCell)]
    public InArgument<ExcelXAxisDirectionEnum> XAxisDirection { get; set; } = new InArgument<ExcelXAxisDirectionEnum>(ExcelXAxisDirectionEnum.Left);

    [DisplayName("Y-Axis Direction"), Description("The direction to move vertically from the currently active cell.")]
    [RenderIfCondition(nameof(ClearMode), CellClearModeEnum.RangeRelativeToActiveCell)]
    public InArgument<ExcelYAxisDirectionEnum> YAxisDirection { get; set; } = new InArgument<ExcelYAxisDirectionEnum>(ExcelYAxisDirectionEnum.Above);

    [DisplayName("X Offset"), Description("Number of cells to move horizontally from the active cell.")]
    [RenderIfCondition(nameof(ClearMode), CellClearModeEnum.RangeRelativeToActiveCell)]
    public InArgument<int> XOffset { get; set; } = new InArgument<int>();

    [DisplayName("Y Offset"), Description("Number of cells to move vertically from the active cell.")]
    [RenderIfCondition(nameof(ClearMode), CellClearModeEnum.RangeRelativeToActiveCell)]
    public InArgument<int> YOffset { get; set; } = new InArgument<int>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            dynamic worksheet = WorksheetInstance.Get(context);
            var clearMode = ClearMode.Get(context);

            if (worksheet == null)
            {
                dynamic excelApp = ComHelper.GetActiveObject("Excel.Application");
                worksheet = excelApp?.ActiveSheet;
            }

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance is not available.");

            switch (clearMode)
            {
                case CellClearModeEnum.SingleCell:
                    {
                        var colStr = Column.Get(context);
                        var row = Row.Get(context);
                        if (!int.TryParse(colStr, out var colNum))
                            colNum = GetColumnIndex(colStr);
                        var targetCell = worksheet.Cells[row, colNum];
                        if (targetCell == null)
                            throw new InvalidOperationException($"Cell at Row {row}, Column {colStr} does not exist.");
                        targetCell.Clear();
                        status = $"Cleared cell at Row {row}, Column {colStr}.";
                        break;
                    }

                case CellClearModeEnum.NamedCells:
                    {
                        var name = Name.Get(context);
                        dynamic namedRange = null;
                        try { namedRange = worksheet.Names.Item(name)?.RefersToRange; } catch { }
                        if (namedRange != null)
                        {
                            namedRange.Clear();
                            status = $"Cleared named range '{name}'.";
                        }
                        else
                        {
                            status = $"Named range '{name}' not found.";
                        }
                        break;
                    }

                case CellClearModeEnum.RangeOfCells:
                    {
                        var startColStr = StartColumn.Get(context);
                        var endColStr = EndColumn.Get(context);
                        var startRow = StartRow.Get(context);
                        var endRow = EndRow.Get(context);
                        int startColNum = int.TryParse(startColStr, out var tempStart) ? tempStart : GetColumnIndex(startColStr);
                        int endColNum = int.TryParse(endColStr, out var tempEnd) ? tempEnd : GetColumnIndex(endColStr);
                        var range = worksheet.Range[worksheet.Cells[startRow, startColNum], worksheet.Cells[endRow, endColNum]];
                        range.Clear();
                        status = $"Cleared range from Row {startRow}, Column {startColStr} to Row {endRow}, Column {endColStr}.";
                        break;
                    }

                case CellClearModeEnum.RangeRelativeToActiveCell:
                    {
                        var xDir = XAxisDirection.Get(context);
                        var yOffset = YOffset.Get(context);
                        var xOffset = XOffset.Get(context);
                        var activeCell = worksheet.Application.ActiveCell;
                        if (activeCell == null)
                            throw new InvalidOperationException("No active cell found in the worksheet.");

                        dynamic targetRange = xDir switch
                        {
                            ExcelXAxisDirectionEnum.Left => activeCell.Offset[yOffset, -xOffset],
                            ExcelXAxisDirectionEnum.Right => activeCell.Offset[yOffset, xOffset],
                            _ => throw new ArgumentOutOfRangeException(nameof(xDir))
                        };

                        targetRange?.Clear();
                        status = $"Cleared cell relative to active cell ({xDir}).";
                        break;
                    }

                default:
                    throw new ArgumentOutOfRangeException(nameof(clearMode));
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error clearing cells: {ex.Message}");
        }
    }

    private static int GetColumnIndex(string columnName)
    {
        if (string.IsNullOrEmpty(columnName)) return -1;
        columnName = columnName.ToUpperInvariant();
        return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
    }
}





