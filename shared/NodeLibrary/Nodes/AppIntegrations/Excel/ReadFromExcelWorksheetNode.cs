using NodeLibrary.ExcelNodes.Enums;
using NodeLibrary.ExcelNodes.Helpers;
using NodeLibrary.Office;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Read from Excel Worksheet"), Description("Reads values from a specified cell range in the given Excel worksheet.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class ReadFromExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet object from which to read data. If omitted, the active worksheet of the running Excel instance is used.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("Retrieve Mode"), Description("Specifies how to retrieve data from the worksheet.")]
    public required InArgument<ExcelRetrieveModeEnum> RetrieveMode { get; set; } = new InArgument<ExcelRetrieveModeEnum>(ExcelRetrieveModeEnum.SingleCell);

    [DisplayName("Start Column"), Description("The starting column, as a letter (e.g., 'A') or a 1-based index (e.g., '1').")]
    [RenderIfOperator(LogicalOperatorEnum.OR)]
    [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.SingleCell)]
    [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.RangeOfCells)]
    public InArgument<string> StartColumn { get; set; } = new InArgument<string>();

    [DisplayName("Start Row"), Description("The starting row of the range to read.")]
    [RenderIfOperator(LogicalOperatorEnum.OR)]
    [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.SingleCell)]
    [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.RangeOfCells)]
    public InArgument<int> StartRow { get; set; } = new InArgument<int>();

    [DisplayName("End Column"), Description("The ending column, as a letter (e.g., 'D') or a 1-based index (e.g., '4').")]
    [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.RangeOfCells)]
    public InArgument<string> EndColumn { get; set; } = new InArgument<string>();

    [DisplayName("End Row"), Description("The ending row of the range to read.")]
    [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.RangeOfCells)]
    public InArgument<int> EndRow { get; set; } = new InArgument<int>();

    [DisplayName("Name"), Description("The name of the named range to read.")]
    [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.ValuesOfNamedCells)]
    public InArgument<string> Name { get; set; } = new InArgument<string>();

    [DisplayName("Get Cell Contents as Text"), Description("If true, retrieves cell contents as text; otherwise, retrieves raw values.")]
    public InArgument<bool> GetContentsAsText { get; set; } = new InArgument<bool>();

    [DisplayName("First Line of Range Contains Column Names"), Description("If true, treats the first row as column names.")]
    [RenderIfOperator(LogicalOperatorEnum.OR)]
    [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.RangeOfCells)]
    [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.AllAvailableValues)]
    [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.Selection)]
    [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.ValuesOfNamedCells)]
    public InArgument<bool> FirstLineContainsColumnNames { get; set; } = new InArgument<bool>();

    [DisplayName("Trim Trailing Empty Columns and Rows"), Description("If true, omits empty columns to the right and empty rows at the bottom of the range.")]
    public InArgument<bool> TrimTrailingEmptyRowsAndColumns { get; set; } = new InArgument<bool>();

    [DisplayName("Excel Data"), Description("Returns the data read from the specified range as a DataTable.")]
    public OutArgument<DataTable> ExcelData { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Starting Excel read...";
        DataTable dataTable = null;
        dynamic worksheet = null;
        dynamic range = null;

        try
        {
            dynamic worksheetArg = WorksheetInstance.Get(context);
            var retrieveMode = RetrieveMode.Get(context);

            if (worksheetArg == null)
            {
                var excelApp = OfficeAutomationHelper.GetActiveApplication(OfficeApplication.Excel, createIfMissing: false);
                worksheet = excelApp?.ActiveSheet;
            }
            else
            {
                worksheet = worksheetArg;
            }

            if (worksheet == null)
                throw new InvalidOperationException("No valid worksheet found to read from.");

            var startCol = StartColumn.Get(context);
            var startRow = StartRow.Get(context);
            var endCol = EndColumn.Get(context);
            var endRow = EndRow.Get(context);
            var name = Name.Get(context);
            var getContentsAsText = GetContentsAsText.Get(context);
            var firstLineContainsColumnNames = FirstLineContainsColumnNames.Get(context);
            var trimEmpty = TrimTrailingEmptyRowsAndColumns.Get(context);

            switch (retrieveMode)
            {
                case ExcelRetrieveModeEnum.SingleCell:
                    int colIndex = ResolveColumnIndex(startCol);
                    ValidateRow(startRow, nameof(StartRow));
                    var cell = worksheet.Cells[startRow, colIndex];
                    dataTable = new DataTable();
                    dataTable.Columns.Add("Value");
                    dataTable.Rows.Add(GetCellValue(cell, getContentsAsText));
                    break;

                case ExcelRetrieveModeEnum.RangeOfCells:
                    int startIndex = ResolveColumnIndex(startCol);
                    int endIndex = ResolveColumnIndex(endCol);
                    ValidateRow(startRow, nameof(StartRow));
                    ValidateRow(endRow, nameof(EndRow));
                    if (endRow < startRow)
                        throw new ArgumentException($"End Row ({endRow}) must be greater than or equal to Start Row ({startRow}).");
                    if (endIndex < startIndex)
                        throw new ArgumentException("End Column must be greater than or equal to Start Column.");
                    var startCell = worksheet.Cells[startRow, startIndex];
                    var endCell = worksheet.Cells[endRow, endIndex];
                    range = worksheet.Range[startCell, endCell];
                    dataTable = ReadRange(range, getContentsAsText, firstLineContainsColumnNames, trimEmpty);
                    break;

                case ExcelRetrieveModeEnum.AllAvailableValues:
                    range = worksheet.UsedRange;
                    dataTable = range == null
                        ? new DataTable()
                        : ReadRange(range, getContentsAsText, firstLineContainsColumnNames, trimEmpty);
                    break;

                case ExcelRetrieveModeEnum.Selection:
                    range = worksheet.Application.Selection;
                    if (range == null)
                        throw new InvalidOperationException("No cells are currently selected in the worksheet.");
                    dataTable = ReadRange(range, getContentsAsText, firstLineContainsColumnNames, trimEmpty);
                    break;

                case ExcelRetrieveModeEnum.ValuesOfNamedCells:
                    if (string.IsNullOrWhiteSpace(name))
                        throw new ArgumentException("Name is required when retrieving values of named cells.");
                    range = worksheet.Names.Item(name)?.RefersToRange;
                    if (range == null)
                        throw new ArgumentException($"Named range '{name}' not found.");
                    dataTable = ReadRange(range, getContentsAsText, firstLineContainsColumnNames, trimEmpty);
                    break;

                default:
                    throw new ArgumentOutOfRangeException(nameof(retrieveMode));
            }

            ExcelData.Set(context, dataTable);
            IsSuccess.Set(context, true);
            status = $"Read {dataTable?.Rows.Count} row(s) and {dataTable?.Columns.Count} column(s) from '{worksheet.Name}'.";
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ExcelData.Set(context, null);
            IsSuccess.Set(context, false);
            status = $"Error reading from Excel: {ex.Message}";
            StatusMessage.Set(context, status);
        }
        finally
        {
            ReleaseObject(range);
            ReleaseObject(worksheet);
        }
    }

    private static int ResolveColumnIndex(string column)
    {
        if (string.IsNullOrWhiteSpace(column))
            throw new ArgumentException("Column cannot be empty.", nameof(column));

        column = column.Trim();

        // Accept a numeric index (e.g., "1") or a letter (e.g., "A").
        if (int.TryParse(column, out int numericIndex))
        {
            if (numericIndex < 1)
                throw new ArgumentOutOfRangeException(nameof(column), "Column index must be >= 1.");
            return numericIndex;
        }

        return ExcelColumnHelper.GetColumnIndex(column);
    }

    private static void ValidateRow(int row, string paramName)
    {
        if (row < 1)
            throw new ArgumentOutOfRangeException(paramName, "Row must be >= 1.");
    }

    private static object GetCellValue(dynamic cell, bool getContentsAsText)
    {
        if (cell == null)
            return DBNull.Value;

        if (getContentsAsText)
        {
            object text = cell.Text;
            return text ?? DBNull.Value;
        }

        object value = cell.Value2;
        return value ?? DBNull.Value;
    }

    private static DataTable ReadRange(dynamic range, bool getContentsAsText, bool firstLineContainsColumnNames, bool trimEmpty)
    {
        var dataTable = new DataTable();

        if (range == null)
            return dataTable;

        int rowCount = range.Rows.Count;
        int colCount = range.Columns.Count;

        if (rowCount == 0 || colCount == 0)
            return dataTable;

        // Value2 is usually object[,], but for a single cell it returns a scalar.
        object rawValue2 = range.Value2;
        if (rawValue2 is null)
            return dataTable;

        if (rawValue2 is not object[,] values)
        {
            // Single-cell range: return a one-cell table honoring the text flag.
            dataTable.Columns.Add("Value");
            dataTable.Rows.Add(getContentsAsText ? (range.Text ?? DBNull.Value) : (rawValue2 ?? DBNull.Value));
            return dataTable;
        }

        int maxRow = values.GetLength(0);
        int maxCol = values.GetLength(1);

        if (maxRow == 0 || maxCol == 0)
            return dataTable;

        if (trimEmpty)
        {
            while (maxRow > 1 && Enumerable.Range(1, maxCol).All(c => values[maxRow, c] == null))
                maxRow--;

            while (maxCol > 1 && Enumerable.Range(1, maxRow).All(r => values[r, maxCol] == null))
                maxCol--;
        }

        int startRow = firstLineContainsColumnNames ? 2 : 1;

        var usedNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        for (int j = 1; j <= maxCol; j++)
        {
            string columnName = $"Column{j}";
            if (firstLineContainsColumnNames)
            {
                var header = values[1, j]?.ToString();
                if (!string.IsNullOrWhiteSpace(header))
                    columnName = header;
            }

            columnName = MakeUniqueColumnName(columnName, usedNames);
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

    private static string MakeUniqueColumnName(string baseName, HashSet<string> usedNames)
    {
        string candidate = baseName;
        int suffix = 2;
        while (!usedNames.Add(candidate))
        {
            candidate = $"{baseName}_{suffix}";
            suffix++;
        }
        return candidate;
    }

    private static void ReleaseObject(object obj)
    {
        try { if (obj != null) OfficeAutomationHelper.Release(obj); }
        catch { }
    }
}




