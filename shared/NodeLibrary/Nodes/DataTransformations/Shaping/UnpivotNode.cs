using System.Data;

namespace NodeLibrary.ShapingNodes;

[DisplayName("Unpivot"), Description("Melts a wide data table into a long format. Designated value columns are turned into two columns: one holding the column name and one holding the value, with the remaining columns kept per row.")]
[NodeMetadata(icon: "/assets/Shaping.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class UnpivotNode : BaseNode
{
    [DisplayName("Data Table"), Description("The wide data table to unpivot.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Columns To Unpivot"), Description("Comma-separated column names to melt into name/value pairs. Leave empty to unpivot all columns.")]
    public InArgument<string> ColumnsToUnpivot { get; set; } = new InArgument<string>();

    [DisplayName("Name Column"), Description("The name of the column that will hold the original column names. Defaults to 'Column'.")]
    public InArgument<string> NameColumn { get; set; } = new InArgument<string>("Column");

    [DisplayName("Value Column"), Description("The name of the column that will hold the cell values. Defaults to 'Value'.")]
    public InArgument<string> ValueColumn { get; set; } = new InArgument<string>("Value");

    [DisplayName("Unpivoted Data Table"), Description("The resulting long-format data table.")]
    public OutArgument<DataTable> UnpivotedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var columnsToUnpivot = ColumnsToUnpivot.Get(context);
            var nameColumn = NameColumn.Get(context);
            var valueColumn = ValueColumn.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");

            var unpivotCols = string.IsNullOrWhiteSpace(columnsToUnpivot)
                ? dataTable.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToList()
                : columnsToUnpivot.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

            foreach (var col in unpivotCols)
                if (!dataTable.Columns.Contains(col))
                    throw new ArgumentException($"Column '{col}' does not exist in the data table.");

            var unpivotSet = new HashSet<string>(unpivotCols);
            var idCols = dataTable.Columns.Cast<DataColumn>().Where(c => !unpivotSet.Contains(c.ColumnName)).Select(c => c.ColumnName).ToList();

            var result = new DataTable();
            foreach (var idCol in idCols)
                result.Columns.Add(idCol, dataTable.Columns[idCol].DataType);
            result.Columns.Add(nameColumn, typeof(string));
            result.Columns.Add(valueColumn, typeof(object));

            foreach (var row in dataTable.AsEnumerable())
            {
                foreach (var col in unpivotCols)
                {
                    var newRow = result.NewRow();
                    foreach (var idCol in idCols)
                        newRow[idCol] = row[idCol];
                    newRow[nameColumn] = col;
                    newRow[valueColumn] = row[col] is DBNull ? DBNull.Value : row[col];
                    result.Rows.Add(newRow);
                }
            }

            UnpivotedDataTable.Set(context, result);
            status = $"Successfully unpivoted data table into {result.Rows.Count} rows.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            UnpivotedDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error unpivoting data table: {ex.Message}");
        }
    }
}
