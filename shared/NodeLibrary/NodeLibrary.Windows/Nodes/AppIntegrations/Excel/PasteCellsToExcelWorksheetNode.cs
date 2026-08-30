using NodeLibrary.ExcelNodes.Enums;

using NodeLibrary.Office;
namespace NodeLibrary.ExcelNodes;

[DisplayName("Paste Cells to Excel Worksheet"), Description("Pastes previously copied cells to a specified location in an Excel worksheet.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class PasteCellsToExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet where cells will be pasted.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("Paste Mode"), Description("Specifies where to paste: to a specific cell, named range, or active cell.")]
    public required InArgument<CellPasteModeEnum> PasteMode { get; set; } = new InArgument<CellPasteModeEnum>(CellPasteModeEnum.OnNamedCells);

    [DisplayName("Column"), Description("The column letter or number of the target cell for pasting.")]
    [RenderIfCondition(nameof(PasteMode), CellPasteModeEnum.OnSpecifiedCell)]
    public InArgument<string> Column { get; set; } = new InArgument<string>();

    [DisplayName("Row"), Description("The row number of the target cell for pasting.")]
    [RenderIfCondition(nameof(PasteMode), CellPasteModeEnum.OnSpecifiedCell)]
    public InArgument<int> Row { get; set; } = new InArgument<int>();

    [DisplayName("Name"), Description("The name of the target named range.")]
    [RenderIfCondition(nameof(PasteMode), CellPasteModeEnum.OnNamedCells)]
    public InArgument<string> Name { get; set; } = new InArgument<string>();

    [DisplayName("Paste Type"), Description("The type of paste operation to perform.")]
    public InArgument<ExcelPasteTypeEnum> PasteType { get; set; } = new InArgument<ExcelPasteTypeEnum>(ExcelPasteTypeEnum.All);

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic? worksheet = WorksheetInstance.Get(context);
            var pasteMode = PasteMode.Get(context);
            var pasteType = PasteType.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            dynamic targetRange;

            switch (pasteMode)
            {
                case CellPasteModeEnum.OnSpecifiedCell:
                    {
                        var colStr = Column.Get(context) ?? string.Empty;
                        var row = Row.Get(context);
                        int colNum = int.TryParse(colStr, out int num) ? num : GetColumnIndex(colStr);
                        targetRange = worksheet.Cells[row, colNum];
                        break;
                    }

                case CellPasteModeEnum.OnNamedCells:
                    {
                        var name = Name.Get(context) ?? string.Empty;
                        targetRange = worksheet.Range[name];
                        if (targetRange == null)
                            throw new InvalidOperationException($"Named range '{name}' not found.");
                        break;
                    }

                case CellPasteModeEnum.OnCurrentlyActiveCell:
                    {
                        targetRange = worksheet.Application.ActiveCell;
                        if (targetRange == null)
                            throw new InvalidOperationException("No active cell found.");
                        break;
                    }

                default:
                    throw new ArgumentOutOfRangeException(nameof(pasteMode));
            }

            targetRange.Select();

            var xlPasteType = pasteType switch
            {
                ExcelPasteTypeEnum.All => OfficeConstants.XlPasteAll,
                ExcelPasteTypeEnum.Values => OfficeConstants.XlPasteValues,
                ExcelPasteTypeEnum.Formulas => OfficeConstants.XlPasteFormulas,
                ExcelPasteTypeEnum.Formats => OfficeConstants.XlPasteFormats,
                ExcelPasteTypeEnum.Comments => OfficeConstants.XlPasteComments,
                _ => OfficeConstants.XlPasteAll
            };

            worksheet.PasteSpecial(Format: xlPasteType);

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully pasted to {targetRange.Address}.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error pasting cells: {ex.Message}");
        }
    }

    private static int GetColumnIndex(string columnName)
    {
        if (string.IsNullOrEmpty(columnName)) return -1;
        columnName = columnName.ToUpperInvariant();
        return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
    }
}






