
namespace NodeLibrary.ExcelNodes;

[DisplayName("Get Table Range from Excel Worksheet"), Description("Gets the range address, row count, and column count of an Excel Table (ListObject) in the specified worksheet.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class GetTableRangeFromExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet containing the table.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("Table Name"), Description("The name of the table (ListObject) to retrieve. If empty, uses the first table found.")]
    public InArgument<string> TableName { get; set; } = new InArgument<string>();

    [DisplayName("Table Range Address"), Description("The address of the table range.")]
    public OutArgument<string> TableRangeAddress { get; set; } = new OutArgument<string>();

    [DisplayName("Row Count"), Description("The number of data rows in the table.")]
    public OutArgument<int> RowCount { get; set; } = new OutArgument<int>();

    [DisplayName("Column Count"), Description("The number of columns in the table.")]
    public OutArgument<int> ColumnCount { get; set; } = new OutArgument<int>();

    [DisplayName("Start Row"), Description("The starting row of the table data (excluding header).")]
    public OutArgument<int> StartRow { get; set; } = new OutArgument<int>();

    [DisplayName("Start Column"), Description("The starting column of the table.")]
    public OutArgument<int> StartColumn { get; set; } = new OutArgument<int>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic worksheet = WorksheetInstance.Get(context);
            var tableName = TableName.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            if (worksheet.ListObjects.Count == 0)
                throw new InvalidOperationException("No tables found in the worksheet.");

            dynamic table;
            if (!string.IsNullOrWhiteSpace(tableName))
            {
                table = null;
                foreach (var lo in worksheet.ListObjects)
                {
                    if (lo.Name.Equals(tableName, StringComparison.OrdinalIgnoreCase))
                    {
                        table = lo;
                        break;
                    }
                }
                if (table == null)
                    throw new InvalidOperationException($"Table '{tableName}' not found in the worksheet.");
            }
            else
            {
                table = worksheet.ListObjects[1];
            }

            var range = table.Range;
            var dataBody = table.DataBodyRange;

            TableRangeAddress.Set(context, range.Address);
            RowCount.Set(context, dataBody?.Rows.Count ?? 0);
            ColumnCount.Set(context, range.Columns.Count);
            StartRow.Set(context, dataBody?.Row ?? range.Row + 1);
            StartColumn.Set(context, range.Column);

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Table '{table.Name}' range: {range.Address}.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error getting table range: {ex.Message}");
        }
    }
}





