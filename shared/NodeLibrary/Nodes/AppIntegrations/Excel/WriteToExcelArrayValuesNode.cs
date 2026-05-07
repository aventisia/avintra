using NodeLibrary.ExcelNodes.Enums;
using Excel = Microsoft.Office.Interop.Excel;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Write Array Values to Excel"), Description("Writes an array of values to consecutive cells in an Excel worksheet, either horizontally or vertically.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class WriteToExcelArrayValuesNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet where the values will be written.")]
    public required InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

    [DisplayName("Values"), Description("The array of values to write to the worksheet.")]
    public required InArgument<List<string>> Values { get; set; }

    [DisplayName("Start Column"), Description("The starting column where values will be written (letter or number).")]
    public required InArgument<string> StartColumn { get; set; }

    [DisplayName("Start Row"), Description("The starting row where values will be written.")]
    public required InArgument<int> StartRow { get; set; }

    [DisplayName("Write Direction"), Description("The direction to write the values: Horizontal (across columns) or Vertical (down rows).")]
    public InArgument<ExcelWriteDirectionEnum> WriteDirection { get; set; } = new InArgument<ExcelWriteDirectionEnum>(ExcelWriteDirectionEnum.Vertical);

    protected override void Execute(INodeContext context)
    {
        try
        {
            var worksheet = WorksheetInstance.Get(context);
            var values = Values.Get(context);
            var startColStr = StartColumn.Get(context);
            var startRow = StartRow.Get(context);
            var direction = WriteDirection.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            if (values == null || values.Count == 0)
                throw new ArgumentException("Values array cannot be null or empty.");

            int startCol = int.TryParse(startColStr, out int num) ? num : GetColumnIndex(startColStr);

            if (startCol < 1)
                throw new ArgumentException($"Invalid start column: '{startColStr}'.");

            for (int i = 0; i < values.Count; i++)
            {
                if (direction == ExcelWriteDirectionEnum.Vertical)
                    ((Excel.Range)worksheet.Cells[startRow + i, startCol]).Value2 = values[i];
                else
                    ((Excel.Range)worksheet.Cells[startRow, startCol + i]).Value2 = values[i];
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully wrote {values.Count} values starting at Row {startRow}, Column {startColStr} ({direction}).");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error writing array values: {ex.Message}");
        }
    }

    private static int GetColumnIndex(string columnName)
    {
        if (string.IsNullOrEmpty(columnName)) return -1;
        columnName = columnName.ToUpperInvariant();
        return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
    }
}
