using NodeLibrary.ExcelNodes.Enums;
using NodeLibrary.Office;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Write to Excel Worksheet"), Description("Writes a value to a specific cell or range of cells in an Excel worksheet.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class WriteToExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet object where the value will be written.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("Value To Write"), Description("The value (text or DataTable) to write into the specified cell or range.")]
    public required InArgument<object> ValueToWrite { get; set; }

    [DisplayName("Write Mode"), Description("Specifies how to determine the target cell(s) for writing.")]
    public required InArgument<ExcelCellWriteModeEnum> WriteMode { get; set; }

    [DisplayName("Column Index"), Description("The index of the column (1 for 'A'). Takes precedence if greater than 0.")]
    [RenderIfCondition(nameof(WriteMode), ExcelCellWriteModeEnum.OnSpecifiedCell)]
    public InArgument<int> ColumnIndex { get; set; } = new InArgument<int>();

    [DisplayName("Row"), Description("The row number where the data should be written.")]
    [RenderIfCondition(nameof(WriteMode), ExcelCellWriteModeEnum.OnSpecifiedCell)]
    public InArgument<int> Row { get; set; } = new InArgument<int>();

    [DisplayName("Name"), Description("The name of the named range to write to.")]
    [RenderIfCondition(nameof(WriteMode), ExcelCellWriteModeEnum.OnNamedCells)]
    public InArgument<string> Name { get; set; } = new InArgument<string>();

    [DisplayName("Populate Entire Range"), Description("If true, populates the entire named range with the same value.")]
    public InArgument<bool> PopulateEntireRange { get; set; } = new InArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            dynamic worksheetArg = WorksheetInstance.Get(context);
            dynamic rawValue = ValueToWrite.Get(context);
            var writeMode = WriteMode.Get(context);
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
                throw new InvalidOperationException("Worksheet instance is not provided or active sheet not found.");

            var workbook = worksheet.Parent;

            switch (writeMode)
            {
                case ExcelCellWriteModeEnum.OnSpecifiedCell:
                    {
                        int rowNumber = Row.Get(context);
                        int colIndex = ColumnIndex.Get(context);

                        if (colIndex <= 0)
                            throw new ArgumentException("Either 'Column Index' or 'Column' must be provided.");

                        if (rowNumber <= 0)
                            throw new ArgumentException("Row number must be greater than zero.");

                        var targetCell = worksheet.Cells[rowNumber, colIndex];
                        if (targetCell == null)
                            throw new ArgumentException($"Invalid cell reference at row {rowNumber} and column index {colIndex}.");

                        WriteValueToRange(targetCell, rawValue);
                        break;
                    }

                case ExcelCellWriteModeEnum.OnCurrentlyActiveCell:
                    {
                        var activeCell = worksheet.Application.Selection;
                        if (activeCell == null)
                            throw new InvalidOperationException("No active cell found in worksheet.");
                        WriteValueToRange(activeCell, rawValue);
                        break;
                    }

                case ExcelCellWriteModeEnum.OnNamedCells:
                    {
                        var name = Name.Get(context);
                        var populateEntireRange = PopulateEntireRange.Get(context);

                        if (string.IsNullOrWhiteSpace(name))
                            throw new ArgumentException("Name cannot be empty when using 'On Named Cells' mode.");

                        dynamic? namedRange = null;

                        try
                        {
                            namedRange = workbook?.Names?.Item(name)?.RefersToRange;
                        }
                        catch
                        {
                            try
                            {
                                namedRange = worksheet?.Names?.Item(name)?.RefersToRange;
                            }
                            catch
                            {
                                throw new ArgumentException($"Named range '{name}' not found in workbook or worksheet.");
                            }
                        }

                        if (namedRange == null)
                            throw new ArgumentException($"Named range '{name}' not found.");

                        if (rawValue is DataTable dataTable)
                        {
                            if (dataTable.Rows.Count == 0 || dataTable.Columns.Count == 0)
                                throw new ArgumentException("DataTable is empty.");

                            WriteDataTableToRange(namedRange, dataTable, populateEntireRange);
                        }
                        else
                        {
                            string value = rawValue?.ToString();
                            if (string.IsNullOrEmpty(value))
                                throw new ArgumentException("Value to write cannot be null or empty.");

                            if (populateEntireRange)
                                namedRange.Value = value;
                            else
                                namedRange.Cells[1, 1].Value = value;
                        }
                        break;
                    }

                default:
                    throw new ArgumentOutOfRangeException(nameof(writeMode));
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Successfully wrote to Excel worksheet.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error writing to Excel worksheet: {ex.Message}");
        }
    }

    private void WriteValueToRange(dynamic range, object value)
    {
        if (value is DataTable dataTable)
        {
            WriteDataTableToRange(range, dataTable, false);
        }
        else
        {
            string finalValue = string.Empty;

            if (value == null)
                finalValue = string.Empty;
            else if (value is string stringValue)
                finalValue = stringValue;
            else if (value is IEnumerable<string> stringList)
                finalValue = string.Join(Environment.NewLine, stringList);
            else
                finalValue = value.ToString();

            range.Value = finalValue;
            range.WrapText = true;
        }
    }

    private void WriteDataTableToRange(dynamic startCell, DataTable dataTable, bool populateEntireRange)
    {
        if (dataTable.Rows.Count == 0 || dataTable.Columns.Count == 0)
            return;

        int rowCount = dataTable.Rows.Count;
        int colCount = dataTable.Columns.Count;

        object[,] values = new object[rowCount + 1, colCount];

        for (int c = 0; c < colCount; c++)
            values[0, c] = dataTable.Columns[c].ColumnName;

        for (int r = 0; r < rowCount; r++)
            for (int c = 0; c < colCount; c++)
                values[r + 1, c] = dataTable.Rows[r][c];

        dynamic targetRange = startCell.Resize[rowCount + 1, colCount];
        targetRange.Value = values;
    }

    private static int GetColumnIndex(string columnName)
    {
        if (string.IsNullOrWhiteSpace(columnName))
            throw new ArgumentException("Column name cannot be empty.", nameof(columnName));

        columnName = columnName.ToUpperInvariant();
        return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
    }
}




