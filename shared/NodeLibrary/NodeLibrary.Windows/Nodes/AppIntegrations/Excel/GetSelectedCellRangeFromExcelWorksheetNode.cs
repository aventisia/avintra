
namespace NodeLibrary.ExcelNodes;

[DisplayName("Get Selected Cell Range from Excel Worksheet"), Description("Gets the address and details of the currently selected cell range in an Excel worksheet.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class GetSelectedCellRangeFromExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet from which to get the selected range.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("Selected Range Address"), Description("The address of the currently selected range (e.g., '$A$1:$C$5').")]
    public OutArgument<string> SelectedRangeAddress { get; set; } = new OutArgument<string>();

    [DisplayName("Start Row"), Description("The starting row of the selection.")]
    public OutArgument<int> StartRow { get; set; } = new OutArgument<int>();

    [DisplayName("Start Column"), Description("The starting column number of the selection.")]
    public OutArgument<int> StartColumn { get; set; } = new OutArgument<int>();

    [DisplayName("End Row"), Description("The ending row of the selection.")]
    public OutArgument<int> EndRow { get; set; } = new OutArgument<int>();

    [DisplayName("End Column"), Description("The ending column number of the selection.")]
    public OutArgument<int> EndColumn { get; set; } = new OutArgument<int>();

    [DisplayName("Row Count"), Description("The number of rows in the selection.")]
    public OutArgument<int> RowCount { get; set; } = new OutArgument<int>();

    [DisplayName("Column Count"), Description("The number of columns in the selection.")]
    public OutArgument<int> ColumnCount { get; set; } = new OutArgument<int>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic worksheet = WorksheetInstance.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            var selection = worksheet.Application.Selection;

            if (selection == null)
                throw new InvalidOperationException("No cells are currently selected.");

            SelectedRangeAddress.Set(context, selection.Address);
            StartRow.Set(context, selection.Row);
            StartColumn.Set(context, selection.Column);
            EndRow.Set(context, selection.Row + selection.Rows.Count - 1);
            EndColumn.Set(context, selection.Column + selection.Columns.Count - 1);
            RowCount.Set(context, selection.Rows.Count);
            ColumnCount.Set(context, selection.Columns.Count);

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Selected range: {selection.Address} ({selection.Rows.Count} rows x {selection.Columns.Count} columns).");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error getting selected range: {ex.Message}");
        }
    }
}





