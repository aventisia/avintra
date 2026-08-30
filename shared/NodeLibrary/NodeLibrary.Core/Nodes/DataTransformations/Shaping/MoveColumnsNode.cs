using System.Data;

namespace NodeLibrary.ShapingNodes;

[DisplayName("Move Columns"), Description("Reorders columns in a data table. Specify the desired column order as a comma-separated list; any columns not listed are appended at the end in their original order.")]
[NodeMetadata(icon: "/assets/Shaping.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class MoveColumnsNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table whose columns to reorder.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Column Order"), Description("Comma-separated column names in the desired order.")]
    public required InArgument<string> ColumnOrder { get; set; }

    [DisplayName("Result Data Table"), Description("The resulting data table.")]
    public OutArgument<DataTable> ResultDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var columnOrder = ColumnOrder.Get(context) ?? string.Empty;

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");

            if (string.IsNullOrWhiteSpace(columnOrder))
                throw new ArgumentException("Column Order cannot be empty.");

            var desired = columnOrder.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
            foreach (var col in desired)
                if (!dataTable.Columns.Contains(col))
                    throw new ArgumentException($"Column '{col}' does not exist in the data table.");

            var remaining = dataTable.Columns.Cast<DataColumn>().Where(c => !desired.Contains(c.ColumnName)).Select(c => c.ColumnName).ToList();
            var finalOrder = desired.Concat(remaining).ToList();

            // Rebuild columns in desired order by creating a fresh table.
            var ordered = dataTable.Clone();
            ordered.Columns.Clear();
            foreach (var col in finalOrder)
            {
                var source = dataTable.Columns[col]!;
                ordered.Columns.Add(col, source.DataType);
            }
            foreach (var row in dataTable.AsEnumerable())
            {
                var newRow = ordered.NewRow();
                foreach (var col in finalOrder)
                    newRow[col] = row[col];
                ordered.Rows.Add(newRow);
            }

            ResultDataTable.Set(context, ordered);
            status = "Successfully moved columns.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ResultDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error moving columns: {ex.Message}");
        }
    }
}
