using NodeLibrary.ExcelNodes.Enums;
using Excel = Microsoft.Office.Interop.Excel;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Delete from Excel Worksheet"), Description("Deletes specified cells, rows, columns, or ranges from an Excel worksheet.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class DeleteFromExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet from which to delete.")]
    public required InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

    [DisplayName("Delete Mode"), Description("Specifies what to delete: Single Cell, Range of Cells, Rows, or Columns.")]
    public required InArgument<CellDeletionModeEnum> DeleteMode { get; set; }

    [DisplayName("Start Column"), Description("The starting column of the range.")]
    public InArgument<string> StartColumn { get; set; } = new InArgument<string>();

    [DisplayName("Start Row"), Description("The starting row of the range.")]
    public InArgument<int> StartRow { get; set; } = new InArgument<int>();

    [DisplayName("End Column"), Description("The ending column of the range.")]
    [RenderIfCondition(nameof(DeleteMode), CellDeletionModeEnum.RangeOfCells)]
    public InArgument<string> EndColumn { get; set; } = new InArgument<string>();

    [DisplayName("End Row"), Description("The ending row of the range.")]
    [RenderIfCondition(nameof(DeleteMode), CellDeletionModeEnum.RangeOfCells)]
    public InArgument<int> EndRow { get; set; } = new InArgument<int>();

    [DisplayName("Shift Direction"), Description("The direction to shift remaining cells after deletion.")]
    public InArgument<CellShiftDirectionEnum> ShiftDirection { get; set; } = new InArgument<CellShiftDirectionEnum>(CellShiftDirectionEnum.Up);

    protected override void Execute(INodeContext context)
    {
        try
        {
            var worksheet = WorksheetInstance.Get(context);
            var deleteMode = DeleteMode.Get(context);
            var shiftDirection = ShiftDirection.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            Excel.XlDeleteShiftDirection xlShift = shiftDirection == CellShiftDirectionEnum.Left
                ? Excel.XlDeleteShiftDirection.xlShiftToLeft
                : Excel.XlDeleteShiftDirection.xlShiftUp;

            switch (deleteMode)
            {
                case CellDeletionModeEnum.SingleCell:
                    {
                        var colStr = StartColumn.Get(context);
                        var row = StartRow.Get(context);
                        int colNum = GetColumnIndex(colStr);
                        var cell = (Excel.Range)worksheet.Cells[row, colNum];
                        cell.Delete(xlShift);
                        break;
                    }

                case CellDeletionModeEnum.RangeOfCells:
                    {
                        var startColStr = StartColumn.Get(context);
                        var endColStr = EndColumn.Get(context);
                        var startRow = StartRow.Get(context);
                        var endRow = EndRow.Get(context);
                        int startCol = GetColumnIndex(startColStr);
                        int endCol = GetColumnIndex(endColStr);
                        var range = worksheet.Range[worksheet.Cells[startRow, startCol], worksheet.Cells[endRow, endCol]];
                        range.Delete(xlShift);
                        break;
                    }

                case CellDeletionModeEnum.Rows:
                    {
                        var startRow = StartRow.Get(context);
                        var endRow = EndRow.Get(context);
                        if (endRow == 0) endRow = startRow;
                        var range = worksheet.Range[$"{startRow}:{endRow}"];
                        range.Delete();
                        break;
                    }

                case CellDeletionModeEnum.Columns:
                    {
                        var startColStr = StartColumn.Get(context);
                        var endColStr = EndColumn.Get(context);
                        if (string.IsNullOrEmpty(endColStr)) endColStr = startColStr;
                        var range = worksheet.Range[$"{startColStr}:{endColStr}"];
                        range.Delete();
                        break;
                    }

                default:
                    throw new ArgumentOutOfRangeException(nameof(deleteMode));
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Successfully deleted from worksheet.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error deleting from worksheet: {ex.Message}");
        }
    }

    private static int GetColumnIndex(string columnName)
    {
        if (string.IsNullOrEmpty(columnName)) return -1;
        columnName = columnName.ToUpperInvariant();
        return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
    }
}
