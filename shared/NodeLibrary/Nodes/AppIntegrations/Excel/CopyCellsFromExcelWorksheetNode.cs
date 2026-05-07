using NodeLibrary.ExcelNodes.Enums;
using System.Runtime.InteropServices;
using Excel = Microsoft.Office.Interop.Excel;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Copy Cells from Excel Worksheet"), Description("Copies a specified range of cells from an Excel worksheet for later use or pasting into another worksheet.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class CopyCellsFromExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet object from which to copy data.")]
    public required InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

    [DisplayName("Copy Mode"), Description("Specifies how to copy cells: Single Cell, Named Cells, Selection, or Range of Cells.")]
    public required InArgument<CellCopyModeEnum> CopyMode { get; set; }

    [DisplayName("Start Column"), Description("The starting column of the range to copy.")]
    [RenderIfCondition(nameof(CopyMode), CellCopyModeEnum.RangeOfCells)]
    public InArgument<string> StartColumn { get; set; } = new InArgument<string>();

    [DisplayName("Start Row"), Description("The starting row of the range to copy.")]
    [RenderIfCondition(nameof(CopyMode), CellCopyModeEnum.RangeOfCells)]
    public InArgument<int> StartRow { get; set; } = new InArgument<int>();

    [DisplayName("End Column"), Description("The ending column of the range to copy.")]
    [RenderIfCondition(nameof(CopyMode), CellCopyModeEnum.RangeOfCells)]
    public InArgument<string> EndColumn { get; set; } = new InArgument<string>();

    [DisplayName("End Row"), Description("The ending row of the range to copy.")]
    [RenderIfCondition(nameof(CopyMode), CellCopyModeEnum.RangeOfCells)]
    public InArgument<int> EndRow { get; set; } = new InArgument<int>();

    [DisplayName("Name"), Description("The name of the named range to copy.")]
    [RenderIfCondition(nameof(CopyMode), CellCopyModeEnum.NamedCells)]
    public InArgument<string> Name { get; set; } = new InArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";
        Excel.Worksheet worksheet = null;

        try
        {
            worksheet = WorksheetInstance.Get(context);
            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance is null or invalid.");

            var copyMode = CopyMode.Get(context);

            switch (copyMode)
            {
                case CellCopyModeEnum.SingleCell:
                    {
                        var colStr = StartColumn.Get(context);
                        var row = StartRow.Get(context);
                        int colNum = GetColumnIndex(colStr);
                        var cell = worksheet.Cells[row, colNum] as Excel.Range;
                        if (cell == null)
                            throw new InvalidOperationException($"Cell at Row {row}, Column {colStr} does not exist.");
                        cell.Copy();
                        status = $"Copied cell at Row {row}, Column {colStr}.";
                        Marshal.ReleaseComObject(cell);
                        break;
                    }

                case CellCopyModeEnum.NamedCells:
                    {
                        var name = Name.Get(context);
                        var namedItem = worksheet.Names.Cast<Excel.Name>().FirstOrDefault(n => n.Name == name);
                        if (namedItem == null)
                            throw new InvalidOperationException($"Named range '{name}' not found.");
                        var namedRange = namedItem.RefersToRange;
                        if (namedRange != null)
                        {
                            namedRange.Copy();
                            status = $"Copied named range '{name}'.";
                            Marshal.ReleaseComObject(namedRange);
                        }
                        Marshal.ReleaseComObject(namedItem);
                        break;
                    }

                case CellCopyModeEnum.Selection:
                    {
                        var selection = worksheet.Application.Selection as Excel.Range;
                        if (selection != null)
                        {
                            selection.Copy();
                            status = "Copied selected range.";
                            Marshal.ReleaseComObject(selection);
                        }
                        else
                        {
                            status = "No range is currently selected.";
                        }
                        break;
                    }

                case CellCopyModeEnum.RangeOfCells:
                    {
                        var startColStr = StartColumn.Get(context);
                        var endColStr = EndColumn.Get(context);
                        var startRow = StartRow.Get(context);
                        var endRow = EndRow.Get(context);
                        int startColNum = GetColumnIndex(startColStr);
                        int endColNum = GetColumnIndex(endColStr);
                        var startCell = worksheet.Cells[startRow, startColNum];
                        var endCell = worksheet.Cells[endRow, endColNum];
                        var range = worksheet.Range[startCell, endCell];
                        range.Copy();
                        status = $"Copied range from Row {startRow}, Column {startColStr} to Row {endRow}, Column {endColStr}.";
                        Marshal.ReleaseComObject(startCell);
                        Marshal.ReleaseComObject(endCell);
                        Marshal.ReleaseComObject(range);
                        break;
                    }

                default:
                    throw new ArgumentOutOfRangeException(nameof(copyMode));
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error copying cells: {ex.Message}");
        }
        finally
        {
            if (worksheet != null)
                Marshal.ReleaseComObject(worksheet);
        }
    }

    private static int GetColumnIndex(string columnName)
    {
        if (string.IsNullOrEmpty(columnName)) return -1;
        columnName = columnName.ToUpperInvariant();
        return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
    }
}
