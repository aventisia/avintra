using Excel = Microsoft.Office.Interop.Excel;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Paste DataTable to Excel Worksheet"), Description("Pastes the contents of a DataTable into the specified Excel worksheet at a given location.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class PasteDataTableToExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet where the DataTable will be pasted.")]
    public required InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

    [DisplayName("Data Table"), Description("The DataTable containing the data to paste.")]
    public required InArgument<DataTable> DataTableInput { get; set; }

    [DisplayName("Start Column"), Description("The starting column where data will be pasted (letter or number).")]
    public InArgument<string> StartColumn { get; set; } = new InArgument<string>("A");

    [DisplayName("Start Row"), Description("The starting row where data will be pasted.")]
    public InArgument<int> StartRow { get; set; } = new InArgument<int>(1);

    [DisplayName("Include Headers"), Description("Whether to include the DataTable column headers in the output.")]
    public InArgument<bool> IncludeHeaders { get; set; } = new InArgument<bool>(true);

    protected override void Execute(INodeContext context)
    {
        try
        {
            var worksheet = WorksheetInstance.Get(context);
            var dataTable = DataTableInput.Get(context);
            var startColStr = StartColumn.Get(context);
            var startRow = StartRow.Get(context);
            var includeHeaders = IncludeHeaders.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            if (dataTable == null)
                throw new ArgumentNullException(nameof(DataTableInput), "DataTable cannot be null.");

            int startCol = int.TryParse(startColStr, out int num) ? num : GetColumnIndex(startColStr);
            int currentRow = startRow;

            if (includeHeaders)
            {
                for (int col = 0; col < dataTable.Columns.Count; col++)
                {
                    ((Excel.Range)worksheet.Cells[currentRow, startCol + col]).Value2 = dataTable.Columns[col].ColumnName;
                }
                currentRow++;
            }

            for (int row = 0; row < dataTable.Rows.Count; row++)
            {
                for (int col = 0; col < dataTable.Columns.Count; col++)
                {
                    ((Excel.Range)worksheet.Cells[currentRow + row, startCol + col]).Value2 =
                        dataTable.Rows[row][col]?.ToString() ?? string.Empty;
                }
            }

            int totalRows = dataTable.Rows.Count + (includeHeaders ? 1 : 0);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully pasted DataTable ({dataTable.Rows.Count} rows x {dataTable.Columns.Count} columns) starting at row {startRow}, column {startColStr}.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error pasting DataTable: {ex.Message}");
        }
    }

    private static int GetColumnIndex(string columnName)
    {
        if (string.IsNullOrEmpty(columnName)) return -1;
        columnName = columnName.ToUpperInvariant();
        return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
    }
}
