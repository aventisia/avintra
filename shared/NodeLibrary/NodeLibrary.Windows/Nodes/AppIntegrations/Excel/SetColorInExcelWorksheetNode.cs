using NodeLibrary.ExcelNodes.Enums;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Set Color in Excel Worksheet"), Description("Sets the background color or font color of a specified range of cells in an Excel worksheet.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class SetColorInExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet in which to set color.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("Color Target"), Description("Specifies what to color: Background or Font.")]
    public required InArgument<ExcelColorTargetEnum> ColorTarget { get; set; } = new InArgument<ExcelColorTargetEnum>(ExcelColorTargetEnum.Background);

    [DisplayName("Color Mode"), Description("Specifies how to select cells to color: Single Cell, Range of Cells, or Named Range.")]
    public required InArgument<ExcelSelectionModeForColorEnum> ColorMode { get; set; } = new InArgument<ExcelSelectionModeForColorEnum>(ExcelSelectionModeForColorEnum.SingleCell);

    [DisplayName("Column"), Description("The column of the cell to color.")]
    [RenderIfCondition(nameof(ColorMode), ExcelSelectionModeForColorEnum.SingleCell)]
    public InArgument<string> Column { get; set; } = new InArgument<string>();

    [DisplayName("Row"), Description("The row of the cell to color.")]
    [RenderIfCondition(nameof(ColorMode), ExcelSelectionModeForColorEnum.SingleCell)]
    public InArgument<int> Row { get; set; } = new InArgument<int>();

    [DisplayName("Start Column"), Description("The starting column of the range.")]
    [RenderIfCondition(nameof(ColorMode), ExcelSelectionModeForColorEnum.RangeOfCells)]
    public InArgument<string> StartColumn { get; set; } = new InArgument<string>();

    [DisplayName("Start Row"), Description("The starting row of the range.")]
    [RenderIfCondition(nameof(ColorMode), ExcelSelectionModeForColorEnum.RangeOfCells)]
    public InArgument<int> StartRow { get; set; } = new InArgument<int>();

    [DisplayName("End Column"), Description("The ending column of the range.")]
    [RenderIfCondition(nameof(ColorMode), ExcelSelectionModeForColorEnum.RangeOfCells)]
    public InArgument<string> EndColumn { get; set; } = new InArgument<string>();

    [DisplayName("End Row"), Description("The ending row of the range.")]
    [RenderIfCondition(nameof(ColorMode), ExcelSelectionModeForColorEnum.RangeOfCells)]
    public InArgument<int> EndRow { get; set; } = new InArgument<int>();

    [DisplayName("Named Range"), Description("The named range to color.")]
    [RenderIfCondition(nameof(ColorMode), ExcelSelectionModeForColorEnum.NamedCells)]
    public InArgument<string> NamedRange { get; set; } = new InArgument<string>();

    [DisplayName("Red"), Description("Red component of the color (0-255).")]
    public required InArgument<int> Red { get; set; }

    [DisplayName("Green"), Description("Green component of the color (0-255).")]
    public required InArgument<int> Green { get; set; }

    [DisplayName("Blue"), Description("Blue component of the color (0-255).")]
    public required InArgument<int> Blue { get; set; }

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic? worksheet = WorksheetInstance.Get(context);
            var colorTarget = ColorTarget.Get(context);
            var colorMode = ColorMode.Get(context);
            var red = Red.Get(context);
            var green = Green.Get(context);
            var blue = Blue.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            red = Math.Clamp(red, 0, 255);
            green = Math.Clamp(green, 0, 255);
            blue = Math.Clamp(blue, 0, 255);

            dynamic targetRange;

            switch (colorMode)
            {
                case ExcelSelectionModeForColorEnum.SingleCell:
                    {
                        var colStr = Column.Get(context) ?? string.Empty;
                        var row = Row.Get(context);
                        int colNum = int.TryParse(colStr, out int num) ? num : GetColumnIndex(colStr);
                        targetRange = worksheet.Cells[row, colNum];
                        break;
                    }

                case ExcelSelectionModeForColorEnum.RangeOfCells:
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

                case ExcelSelectionModeForColorEnum.NamedCells:
                    {
                        var name = NamedRange.Get(context) ?? string.Empty;
                        targetRange = worksheet.Range[name];
                        if (targetRange == null)
                            throw new InvalidOperationException($"Named range '{name}' not found.");
                        break;
                    }

                default:
                    throw new ArgumentOutOfRangeException(nameof(colorMode));
            }

            int colorValue = System.Drawing.ColorTranslator.ToOle(System.Drawing.Color.FromArgb(red, green, blue));

            if (colorTarget == ExcelColorTargetEnum.Background)
                targetRange.Interior.Color = colorValue;
            else
                targetRange.Font.Color = colorValue;

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully set {colorTarget} color to RGB({red},{green},{blue}) for {targetRange.Address}.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error setting color: {ex.Message}");
        }
    }

    private static int GetColumnIndex(string columnName)
    {
        if (string.IsNullOrEmpty(columnName)) return -1;
        columnName = columnName.ToUpperInvariant();
        return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
    }
}





