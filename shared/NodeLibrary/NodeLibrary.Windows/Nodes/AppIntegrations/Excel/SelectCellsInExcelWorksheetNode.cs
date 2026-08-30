using NodeLibrary.ExcelNodes.Enums;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Select Cells in Excel Worksheet"), Description("Selects a specified range of cells in an Excel worksheet.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class SelectCellsInExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet in which to select cells.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("Select Mode"), Description("Specifies how to select cells: Single Cell, Named Range, Range of Cells, or All Cells.")]
    public required InArgument<ExcelCellSelectionModeEnum> SelectMode { get; set; } = new InArgument<ExcelCellSelectionModeEnum>(ExcelCellSelectionModeEnum.SingleCell);

    [DisplayName("Column"), Description("The column letter or number of the cell to select.")]
    [RenderIfCondition(nameof(SelectMode), ExcelCellSelectionModeEnum.SingleCell)]
    public InArgument<string> Column { get; set; } = new InArgument<string>();

    [DisplayName("Row"), Description("The row number of the cell to select.")]
    [RenderIfCondition(nameof(SelectMode), ExcelCellSelectionModeEnum.SingleCell)]
    public InArgument<int> Row { get; set; } = new InArgument<int>();

    [DisplayName("Name"), Description("The name of the named range to select.")]
    [RenderIfCondition(nameof(SelectMode), ExcelCellSelectionModeEnum.NamedCells)]
    public InArgument<string> Name { get; set; } = new InArgument<string>();

    [DisplayName("Start Column"), Description("The starting column of the range to select.")]
    [RenderIfCondition(nameof(SelectMode), ExcelCellSelectionModeEnum.RangeOfCells)]
    public InArgument<string> StartColumn { get; set; } = new InArgument<string>();

    [DisplayName("Start Row"), Description("The starting row of the range to select.")]
    [RenderIfCondition(nameof(SelectMode), ExcelCellSelectionModeEnum.RangeOfCells)]
    public InArgument<int> StartRow { get; set; } = new InArgument<int>();

    [DisplayName("End Column"), Description("The ending column of the range to select.")]
    [RenderIfCondition(nameof(SelectMode), ExcelCellSelectionModeEnum.RangeOfCells)]
    public InArgument<string> EndColumn { get; set; } = new InArgument<string>();

    [DisplayName("End Row"), Description("The ending row of the range to select.")]
    [RenderIfCondition(nameof(SelectMode), ExcelCellSelectionModeEnum.RangeOfCells)]
    public InArgument<int> EndRow { get; set; } = new InArgument<int>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic? worksheet = WorksheetInstance.Get(context);
            var selectMode = SelectMode.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            worksheet.Activate();
            dynamic targetRange;

            switch (selectMode)
            {
                case ExcelCellSelectionModeEnum.SingleCell:
                    {
                        var colStr = Column.Get(context) ?? string.Empty;
                        var row = Row.Get(context);
                        int colNum = int.TryParse(colStr, out int num) ? num : GetColumnIndex(colStr);
                        targetRange = worksheet.Cells[row, colNum];
                        break;
                    }

                case ExcelCellSelectionModeEnum.NamedCells:
                    {
                        var name = Name.Get(context) ?? string.Empty;
                        targetRange = worksheet.Range[name];
                        if (targetRange == null)
                            throw new InvalidOperationException($"Named range '{name}' not found.");
                        break;
                    }

                case ExcelCellSelectionModeEnum.RangeOfCells:
                    {
                        var startColStr = StartColumn.Get(context) ?? string.Empty;
                        var endColStr = EndColumn.Get(context) ?? string.Empty;
                        var startRow = StartRow.Get(context);
                        var endRow = EndRow.Get(context);
                        int startCol = int.TryParse(startColStr, out int sc) ? sc : GetColumnIndex(startColStr);
                        int endCol = int.TryParse(endColStr, out int ec) ? ec : GetColumnIndex(endColStr);
                        targetRange = worksheet.Range[worksheet.Cells[startRow, startCol], worksheet.Cells[endRow, endCol]];
                        break;
                    }

                case ExcelCellSelectionModeEnum.AllCells:
                    targetRange = worksheet.Cells;
                    break;

                default:
                    throw new ArgumentOutOfRangeException(nameof(selectMode));
            }

            targetRange.Select();

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully selected {selectMode}: {targetRange.Address}.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error selecting cells: {ex.Message}");
        }
    }

    private static int GetColumnIndex(string columnName)
    {
        if (string.IsNullOrEmpty(columnName)) return -1;
        columnName = columnName.ToUpperInvariant();
        return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
    }
}





