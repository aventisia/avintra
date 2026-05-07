using NodeLibrary.ExcelNodes.Enums;
using NodeLibrary.ExcelNodes.Helpers;
using Excel = Microsoft.Office.Interop.Excel;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Append Range to Excel Worksheet"), Description("Appends a range of data (e.g., from a DataTable) to the active worksheet of an Excel.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class AppendCellsInExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet where data will be appended.")]
    public required InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

    [DisplayName("Data Table"), Description("The DataTable containing the data to be appended to the worksheet.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Append Mode"), Description("Specifies how to append data: To Named Cells or To Active Sheet.")]
    public InArgument<CellAppendModeEnum> AppendMode { get; set; } = new InArgument<CellAppendModeEnum>(CellAppendModeEnum.ToActiveSheet);

    [DisplayName("Name"), Description("The name of the named range to which data should be appended.")]
    [RenderIfCondition(nameof(AppendMode), CellAppendModeEnum.ToNamedCells)]
    public InArgument<string> Name { get; set; } = new InArgument<string>();

    [DisplayName("First Row Has Headers"), Description("If true, skips the first row of the DataTable as it contains headers.")]
    public InArgument<bool> FirstRowHasHeaders { get; set; } = new InArgument<bool>();

    [DisplayName("Starting Column"), Description("The starting column letter where appending should begin (e.g., 'A', 'B', 'AA').")]
    [RenderIfCondition(nameof(AppendMode), CellAppendModeEnum.ToActiveSheet)]
    public InArgument<string> StartingColumn { get; set; } = new InArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var worksheet = WorksheetInstance.Get(context);
            var dataTable = DataTable.Get(context);
            var appendMode = AppendMode.Get(context);
            var hasHeaders = FirstRowHasHeaders.Get(context);
            var startingColumnStr = StartingColumn.Get(context);

            if (worksheet == null)
            {
                var excelApp = (Excel.Application)ComHelper.GetActiveObject("Excel.Application");
                worksheet = excelApp?.ActiveSheet as Excel.Worksheet;
            }

            switch (appendMode)
            {
                case CellAppendModeEnum.ToNamedCells:
                    {
                        var name = Name.Get(context);
                        if (string.IsNullOrWhiteSpace(name))
                            throw new ArgumentException("Name cannot be empty when appending to named cells.");

                        var namedRange = worksheet.Names.Item(name)?.RefersToRange;
                        if (namedRange == null)
                            throw new ArgumentException($"Named range '{name}' not found in the worksheet.");

                        int namedRowCount = namedRange.Rows.Count;
                        int namedColCount = namedRange.Columns.Count;

                        int startRow = -1;
                        for (int r = 1; r <= namedRowCount; r++)
                        {
                            bool isEmpty = true;
                            for (int c = 1; c <= namedColCount; c++)
                            {
                                if (((Excel.Range)namedRange.Cells[r, c])?.Value != null)
                                {
                                    isEmpty = false;
                                    break;
                                }
                            }
                            if (isEmpty)
                            {
                                startRow = r;
                                break;
                            }
                        }

                        if (startRow == -1)
                            startRow = namedRowCount + 1;

                        int rowIndex = 0;
                        foreach (DataRow row in dataTable.Rows)
                        {
                            if (hasHeaders && rowIndex == 0)
                            {
                                rowIndex++;
                                continue;
                            }

                            int adjustedRow = startRow + (rowIndex - (hasHeaders ? 1 : 0));
                            if (adjustedRow > namedRowCount)
                                break;

                            for (int colIndex = 0; colIndex < dataTable.Columns.Count; colIndex++)
                            {
                                var cell = (Excel.Range)namedRange.Cells[adjustedRow, colIndex + 1];
                                cell.Value = row[colIndex]?.ToString();
                            }
                            rowIndex++;
                        }

                        status += $" Appended data to named range '{name}' starting at row {startRow}.";
                        break;
                    }

                case CellAppendModeEnum.ToActiveSheet:
                    {
                        var startColIndex = GetColumnIndex(startingColumnStr);
                        long startRow = worksheet.UsedRange.Rows.Count + 1;

                        for (var i = 0; i < dataTable.Rows.Count; i++)
                        {
                            if (hasHeaders && i == 0)
                                continue;

                            for (var j = 0; j < dataTable.Columns.Count; j++)
                                worksheet.Cells[startRow + i, startColIndex + j] = dataTable.Rows[i][j]?.ToString();
                        }

                        status += $" Appended data to worksheet '{worksheet.Name}' starting at row {startRow}, column {startingColumnStr}.";
                        break;
                    }

                default:
                    throw new ArgumentOutOfRangeException(nameof(appendMode));
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error appending cells: {ex.Message}");
        }
    }

    private static int GetColumnIndex(string columnName)
    {
        if (string.IsNullOrWhiteSpace(columnName))
            throw new ArgumentException("Column name cannot be empty.", nameof(columnName));

        columnName = columnName.ToUpperInvariant();
        return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
    }
}
