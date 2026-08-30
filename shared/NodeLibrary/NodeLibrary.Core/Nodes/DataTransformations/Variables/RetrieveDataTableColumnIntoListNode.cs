namespace NodeLibrary.VariablesNodes;

[DisplayName("Retrieve Data Table Column Into List"), Description("Extracts data from a specified column of a data table into a list. The column can be identified by name or index.")]
[NodeMetadata(icon: "/assets/Variables.svg")]
public class RetrieveDataTableColumnIntoListNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table containing the column to convert into a list.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Column Name or Index"), Description("Specifies which column to extract by name (if defined) or index (zero-based).")]
    public required InArgument<string> ColumnNameOrIndex { get; set; }

    [DisplayName("Column as List"), Description("Returns the contents of the selected column as a list of strings.")]
    public OutArgument<List<string>> ColumnAsList { get; set; } = new OutArgument<List<string>>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var dataTable = DataTable.Get(context);
            var columnNameOrIndex = ColumnNameOrIndex.Get(context);

            if (dataTable == null || dataTable.Columns.Count == 0)
                throw new ArgumentException("DataTable must contain at least one column.");

            DataColumn? column = null;
            var columnIdentifier = columnNameOrIndex ?? string.Empty;

            if (int.TryParse(columnIdentifier, out var columnIndex))
            {
                if (columnIndex < 0 || columnIndex >= dataTable.Columns.Count)
                    throw new ArgumentOutOfRangeException(nameof(columnIndex),
                        $"Column index must be between 0 and {dataTable.Columns.Count - 1}");

                column = dataTable.Columns[columnIndex];
            }
            else
            {
                if (!dataTable.Columns.Contains(columnIdentifier))
                    throw new ArgumentException($"Column '{columnIdentifier}' not found in DataTable.");

                column = dataTable.Columns[columnIdentifier];
            }

            var targetColumn = column ?? throw new InvalidOperationException("Column could not be resolved.");

            var result = (from DataRow row in dataTable.Rows
                          select row[targetColumn] as object
                into value
                          select value?.ToString() ?? string.Empty).ToList();

            ColumnAsList.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully extracted {result.Count} items from column '{targetColumn.ColumnName}'.");
        }
        catch (Exception ex)
        {
            ColumnAsList.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error retrieving column into list: {ex.Message}");
        }
    }
}
