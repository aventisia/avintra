using NodeLibrary.ExcelNodes.Enums;
using NodeLibrary.Office;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Read from Excel Worksheet"), Description("Reads values from a specified cell range in the given Excel worksheet.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class ReadFromExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet object from which to read data.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("Retrieve Mode"), Description("Specifies how to retrieve data from the worksheet.")]
    public required InArgument<ExcelRetrieveModeEnum> RetrieveMode { get; set; }

    [DisplayName("Start Column"), Description("The starting column letter (e.g., 'A').")]
    [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.RangeOfCells)]
    public InArgument<string> StartColumn { get; set; } = new InArgument<string>();

    [DisplayName("Start Column Index"), Description("The starting column index (e.g., 1 for 'A'). Takes precedence if greater than 0.")]
    [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.RangeOfCells)]
    public InArgument<int> StartColumnIndex { get; set; } = new InArgument<int>();

    [DisplayName("Start Row"), Description("The starting row of the range to read.")]
    [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.RangeOfCells)]
    public InArgument<int> StartRow { get; set; } = new InArgument<int>();

    [DisplayName("End Column"), Description("The ending column of the range to read.")]
    [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.RangeOfCells)]
    public InArgument<string> EndColumn { get; set; } = new InArgument<string>();

    [DisplayName("End Column Index"), Description("The ending column index (e.g., 4 for 'D'). Takes precedence if greater than 0.")]
    [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.RangeOfCells)]
    public InArgument<int> EndColumnIndex { get; set; } = new InArgument<int>();

    [DisplayName("End Row"), Description("The ending row of the range to read.")]
    [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.RangeOfCells)]
    public InArgument<int> EndRow { get; set; } = new InArgument<int>();

    [DisplayName("Name"), Description("The name of the named range to read.")]
    [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.ValuesOfNamedCells)]
    public InArgument<string> Name { get; set; } = new InArgument<string>();

    [DisplayName("Get Cell Contents as Text"), Description("If true, retrieves cell contents as text; otherwise, retrieves raw values.")]
    public InArgument<bool> GetContentsAsText { get; set; } = new InArgument<bool>();

    [DisplayName("First Line of Range Contains Column Names"), Description("If true, treats the first row as column names.")]
    public InArgument<bool> FirstLineContainsColumnNames { get; set; } = new InArgument<bool>();

    [DisplayName("Omit Empty Columns and Rows"), Description("If true, omits empty columns to the right and empty rows at the bottom.")]
    [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.ValuesOfNamedCells)]
    public InArgument<bool> OmitEmptyColumnsAndRows { get; set; } = new InArgument<bool>();

    [DisplayName("Excel Data"), Description("Returns the data read from the specified range as a DataTable.")]
    public OutArgument<DataTable> ExcelData { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Starting Excel read...";
        DataTable dataTable = null;

        try
        {
            dynamic worksheetArg = WorksheetInstance.Get(context);
            var retrieveMode = RetrieveMode.Get(context);
            dynamic worksheet;

            if (worksheetArg == null)
            {
                var excelApp = OfficeAutomationHelper.GetActiveApplication(OfficeApplication.Excel);
                worksheet = excelApp.ActiveSheet;
            }
            else
            {
                worksheet = worksheetArg;
            }

            if (worksheet == null)
                throw new InvalidOperationException("No valid worksheet found to read from.");

            var startCol = StartColumn.Get(context);
            var startColIndex = StartColumnIndex.Get(context);
            var startRow = StartRow.Get(context);
            var endCol = EndColumn.Get(context);
            var endColIndex = EndColumnIndex.Get(context);
            var endRow = EndRow.Get(context);
            var name = Name.Get(context);
            var getContentsAsText = GetContentsAsText.Get(context);
            var firstLineContainsColumnNames = FirstLineContainsColumnNames.Get(context);
            var omitEmptyColumnsAndRows = OmitEmptyColumnsAndRows.Get(context);

            switch (retrieveMode)
            {
                case ExcelRetrieveModeEnum.SingleCell:
                    int colIndex = startColIndex > 0 ? startColIndex : GetColumnIndex(startCol);
                    var cell = worksheet.Cells[startRow, colIndex];
                    dataTable = new DataTable();
                    dataTable.Columns.Add("Value");
                    dataTable.Rows.Add(getContentsAsText ? (string)cell.Text : cell.Value2);
                    break;

                case ExcelRetrieveModeEnum.RangeOfCells:
                    int startIndex = startColIndex > 0 ? startColIndex : GetColumnIndex(startCol);
                    int endIndex = endColIndex > 0 ? endColIndex : GetColumnIndex(endCol);
                    var startCell = worksheet.Cells[startRow, startIndex];
                    var endCell = worksheet.Cells[endRow, endIndex];
                    var range = worksheet.Range[startCell, endCell];
                    dataTable = ReadRange(range, getContentsAsText, firstLineContainsColumnNames, omitEmptyColumnsAndRows);
                    break;

                case ExcelRetrieveModeEnum.AllAvailableValues:
                    var usedRange = worksheet.UsedRange;
                    dataTable = ReadRange(usedRange, getContentsAsText, firstLineContainsColumnNames, omitEmptyColumnsAndRows);
                    break;

                case ExcelRetrieveModeEnum.ValuesOfNamedCells:
                    var namedRange = worksheet.Names.Item(name)?.RefersToRange;
                    if (namedRange == null)
                        throw new ArgumentException($"Named range '{name}' not found.");
                    dataTable = ReadRange(namedRange, getContentsAsText, firstLineContainsColumnNames, omitEmptyColumnsAndRows);
                    break;

                default:
                    throw new ArgumentOutOfRangeException(nameof(retrieveMode));
            }

            ExcelData.Set(context, dataTable);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Excel data read successfully.");
        }
        catch (Exception ex)
        {
            ExcelData.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error reading from Excel: {ex.Message}");
        }
    }

    private static DataTable ReadRange(dynamic range, bool getContentsAsText, bool firstLineContainsColumnNames, bool trimEmpty)
    {
        var dataTable = new DataTable();

        int rowCount = range.Rows.Count;
        int colCount = range.Columns.Count;

        if (rowCount == 0 || colCount == 0)
            return dataTable;

        object[,] values = range.Value2 as object[,];
        if (values == null)
            return dataTable;

        int maxRow = values.GetLength(0);
        int maxCol = values.GetLength(1);

        if (trimEmpty)
        {
            while (maxRow > 1 && Enumerable.Range(1, maxCol).All(c => values[maxRow, c] == null))
                maxRow--;

            while (maxCol > 1 && Enumerable.Range(1, maxRow).All(r => values[r, maxCol] == null))
                maxCol--;
        }

        int startRow = firstLineContainsColumnNames ? 2 : 1;

        for (int j = 1; j <= maxCol; j++)
        {
            string columnName = $"Column{j}";
            if (firstLineContainsColumnNames)
            {
                var header = values[1, j]?.ToString();
                if (!string.IsNullOrWhiteSpace(header))
                    columnName = header;
            }
            dataTable.Columns.Add(columnName);
        }

        for (int i = startRow; i <= maxRow; i++)
        {
            var row = dataTable.NewRow();
            for (int j = 1; j <= maxCol; j++)
            {
                object val = values[i, j];
                row[j - 1] = val ?? DBNull.Value;
            }
            dataTable.Rows.Add(row);
        }

        return dataTable;
    }

    private static int GetColumnIndex(string columnName)
    {
        if (string.IsNullOrWhiteSpace(columnName))
            throw new ArgumentException("Column name cannot be empty.", nameof(columnName));

        columnName = columnName.ToUpperInvariant();
        return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
    }
}




