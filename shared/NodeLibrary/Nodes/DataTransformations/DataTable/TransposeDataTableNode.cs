using System.Data;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Transpose Data Table"), Description("Rotates a data table so that columns become rows (long format). Optionally groups data by key columns.")]
[NodeMetadata(icon: "/assets/DataTable.svg", badge: "Beta")]
public class TransposeDataTableNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to transpose.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Key Columns"), Description("Comma-separated column names to keep as-is and repeat for each transposed value column.")]
    public required InArgument<string> KeyColumns { get; set; }

    [DisplayName("Value Columns"), Description("Comma-separated column names whose values become rows. Empty means all non-key columns.")]
    public InArgument<string> ValueColumns { get; set; } = new InArgument<string>();

    [DisplayName("Transposed Data Table"), Description("The resulting transposed data table.")]
    public OutArgument<DataTable> TransposedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var keyColumns = KeyColumns.Get(context);
            var valueColumns = ValueColumns.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");

            var keys = (keyColumns ?? "")
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToList();
            foreach (var k in keys)
            {
                if (!dataTable.Columns.Contains(k))
                    throw new ArgumentException($"Key column '{k}' does not exist in the data table.");
            }

            var valueColNames = (valueColumns ?? "")
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Where(c => dataTable.Columns.Contains(c))
                .ToList();
            if (valueColNames.Count == 0)
                valueColNames = dataTable.Columns.Cast<DataColumn>().Where(c => !keys.Contains(c.ColumnName)).Select(c => c.ColumnName).ToList();

            var resultTable = new DataTable();
            foreach (var k in keys)
                resultTable.Columns.Add(k, typeof(object));
            resultTable.Columns.Add("Field", typeof(string));
            resultTable.Columns.Add("Value", typeof(object));

            foreach (DataRow row in dataTable.Rows)
            {
                foreach (var valueCol in valueColNames)
                {
                    var newRow = resultTable.NewRow();
                    foreach (var k in keys)
                        newRow[k] = row[k];
                    newRow["Field"] = valueCol;
                    newRow["Value"] = row[valueCol];
                    resultTable.Rows.Add(newRow);
                }
            }

            TransposedDataTable.Set(context, resultTable);
            status = $"Successfully transposed data table into {resultTable.Rows.Count} rows.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            TransposedDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error transposing data table: {ex.Message}");
        }
    }
}
