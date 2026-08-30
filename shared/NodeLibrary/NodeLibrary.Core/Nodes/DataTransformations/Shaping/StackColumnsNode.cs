using System.Data;

namespace NodeLibrary.ShapingNodes;

[DisplayName("Stack Columns"), Description("Stacks the values of multiple columns vertically into a single column. Each source column's values become additional rows, keeping the remaining (identifier) columns. Optionally adds a source column name column.")]
[NodeMetadata(icon: "/assets/Shaping.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class StackColumnsNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to stack columns from.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Columns To Stack"), Description("Comma-separated column names to stack into a single column.")]
    public required InArgument<string> ColumnsToStack { get; set; }

    [DisplayName("Result Column"), Description("The name of the column that holds the stacked values. Defaults to 'StackedValue'.")]
    public InArgument<string> ResultColumn { get; set; } = new InArgument<string>("StackedValue");

    [DisplayName("Source Column Column"), Description("Optional name for a column that records which source column each value came from. Leave empty to omit it.")]
    public InArgument<string> SourceColumnColumn { get; set; } = new InArgument<string>();

    [DisplayName("Stacked Data Table"), Description("The resulting stacked data table.")]
    public OutArgument<DataTable> StackedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var columnsToStack = ColumnsToStack.Get(context) ?? string.Empty;
            var resultColumn = ResultColumn.Get(context) ?? string.Empty;
            var sourceColumnColumn = SourceColumnColumn.Get(context) ?? string.Empty;

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");

            if (string.IsNullOrWhiteSpace(columnsToStack))
                throw new ArgumentException("Columns To Stack cannot be empty.");

            if (string.IsNullOrWhiteSpace(resultColumn))
                throw new ArgumentException("Result Column cannot be empty.");

            var stackCols = columnsToStack.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
            foreach (var col in stackCols)
                if (!dataTable.Columns.Contains(col))
                    throw new ArgumentException($"Column '{col}' does not exist in the data table.");

            var stackSet = new HashSet<string>(stackCols);
            var idCols = dataTable.Columns.Cast<DataColumn>().Where(c => !stackSet.Contains(c.ColumnName)).Select(c => c.ColumnName).ToList();

            var result = new DataTable();
            foreach (var idCol in idCols)
                result.Columns.Add(idCol, dataTable.Columns[idCol]!.DataType);
            result.Columns.Add(resultColumn, typeof(object));
            var includeSource = !string.IsNullOrWhiteSpace(sourceColumnColumn);
            if (includeSource)
                result.Columns.Add(sourceColumnColumn, typeof(string));

            foreach (var row in dataTable.AsEnumerable())
            {
                foreach (var col in stackCols)
                {
                    var newRow = result.NewRow();
                    foreach (var idCol in idCols)
                        newRow[idCol] = row[idCol];
                    newRow[resultColumn] = row[col] is DBNull ? DBNull.Value : row[col];
                    if (includeSource)
                        newRow[sourceColumnColumn] = col;
                    result.Rows.Add(newRow);
                }
            }

            StackedDataTable.Set(context, result);
            status = $"Successfully stacked columns into {result.Rows.Count} rows.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            StackedDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error stacking columns: {ex.Message}");
        }
    }
}
