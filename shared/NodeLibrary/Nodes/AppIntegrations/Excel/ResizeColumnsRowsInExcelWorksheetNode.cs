using NodeLibrary.ExcelNodes.Enums;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Resize Columns/Rows in Excel Worksheet"), Description("Resizes (auto-fits or sets specific dimensions for) columns and/or rows in an Excel worksheet.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class ResizeColumnsRowsInExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet in which to resize columns or rows.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("Resize Mode"), Description("Specifies what to resize: Columns, Rows, or Both.")]
    public required InArgument<ExcelColumnResizeTargetEnum> ResizeMode { get; set; }

    [DisplayName("Resize Type"), Description("Specifies how to resize: AutoFit or Fixed Size.")]
    public InArgument<ExcelColumnResizeTypeEnum> ResizeType { get; set; } = new InArgument<ExcelColumnResizeTypeEnum>(ExcelColumnResizeTypeEnum.Autofit);

    [DisplayName("Start Column"), Description("The starting column of the range to resize.")]
    public InArgument<string> StartColumn { get; set; } = new InArgument<string>();

    [DisplayName("End Column"), Description("The ending column of the range to resize.")]
    public InArgument<string> EndColumn { get; set; } = new InArgument<string>();

    [DisplayName("Start Row"), Description("The starting row of the range to resize.")]
    public InArgument<int> StartRow { get; set; } = new InArgument<int>();

    [DisplayName("End Row"), Description("The ending row of the range to resize.")]
    public InArgument<int> EndRow { get; set; } = new InArgument<int>();

    [DisplayName("Column Width"), Description("The specific column width to set (used when ResizeType is FixedSize).")]
    [RenderIfCondition(nameof(ResizeType), ExcelColumnResizeTypeEnum.CustomSize)]
    public InArgument<double> ColumnWidth { get; set; } = new InArgument<double>();

    [DisplayName("Row Height"), Description("The specific row height to set (used when ResizeType is FixedSize).")]
    [RenderIfCondition(nameof(ResizeType), ExcelColumnResizeTypeEnum.CustomSize)]
    public InArgument<double> RowHeight { get; set; } = new InArgument<double>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic worksheet = WorksheetInstance.Get(context);
            var resizeMode = ResizeMode.Get(context);
            var resizeType = ResizeType.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            var startColStr = StartColumn.Get(context);
            var endColStr = EndColumn.Get(context);
            var startRow = StartRow.Get(context);
            var endRow = EndRow.Get(context);

            // Determine column range
            int startCol = string.IsNullOrEmpty(startColStr) ? 1 : (int.TryParse(startColStr, out int sc) ? sc : GetColumnIndex(startColStr));
            int endColNum = string.IsNullOrEmpty(endColStr) ? worksheet.UsedRange.Columns.Count : (int.TryParse(endColStr, out int ec) ? ec : GetColumnIndex(endColStr));
            if (startRow == 0) startRow = 1;
            if (endRow == 0) endRow = worksheet.UsedRange.Rows.Count;

            if (resizeMode == ExcelColumnResizeTargetEnum.Columns || resizeMode == ExcelColumnResizeTargetEnum.Both)
            {
                var colRange = worksheet.Range[worksheet.Cells[1, startCol], worksheet.Cells[1, endColNum]].EntireColumn;
                if (resizeType == ExcelColumnResizeTypeEnum.Autofit)
                {
                    colRange.AutoFit();
                }
                else
                {
                    var width = ColumnWidth.Get(context);
                    if (width > 0)
                        colRange.ColumnWidth = width;
                }
            }

            if (resizeMode == ExcelColumnResizeTargetEnum.Rows || resizeMode == ExcelColumnResizeTargetEnum.Both)
            {
                var rowRange = worksheet.Range[worksheet.Cells[startRow, 1], worksheet.Cells[endRow, 1]].EntireRow;
                if (resizeType == ExcelColumnResizeTypeEnum.Autofit)
                {
                    rowRange.AutoFit();
                }
                else
                {
                    var height = RowHeight.Get(context);
                    if (height > 0)
                        rowRange.RowHeight = height;
                }
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully resized {resizeMode} using {resizeType}.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error resizing: {ex.Message}");
        }
    }

    private static int GetColumnIndex(string columnName)
    {
        if (string.IsNullOrEmpty(columnName)) return -1;
        columnName = columnName.ToUpperInvariant();
        return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
    }
}





