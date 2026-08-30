using System.Data;
using NodeLibrary.DataTableNodes.Helpers;

namespace NodeLibrary.WindowingNodes;

[DisplayName("Last Value By Group"), Description("Adds a column with the last (bottom) value of a source column within each group. Optionally order groups by an ordering column.")]
[NodeMetadata(icon: "/assets/Windowing.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class LastValueByGroupNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to compute last values for.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Group By Columns"), Description("Comma-separated columns that define the groups.")]
    public required InArgument<string> GroupByColumns { get; set; }

    [DisplayName("Source Column"), Description("The column whose last value per group is retrieved.")]
    public required InArgument<string> SourceColumn { get; set; }

    [DisplayName("Order By Column"), Description("Optional column to order rows within each group before picking the last value. Leave empty to use row order.")]
    public InArgument<string> OrderByColumn { get; set; } = new InArgument<string>();

    [DisplayName("Ascending"), Description("True to order ascending, false for descending. Defaults to true.")]
    public InArgument<bool> Ascending { get; set; } = new InArgument<bool>(true);

    [DisplayName("Result Column Name"), Description("The name of the result column. Defaults to '<SourceColumn>_LastValue'.")]
    public InArgument<string> ResultColumnName { get; set; } = new InArgument<string>();

    [DisplayName("Result Data Table"), Description("The resulting data table.")]
    public OutArgument<DataTable> ResultDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var groupByColumns = GroupByColumns.Get(context);
            var sourceColumn = SourceColumn.Get(context);
            var orderByColumn = OrderByColumn.Get(context);
            var ascending = Ascending.Get(context);
            var resultColumnName = ResultColumnName.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(sourceColumn) || !dataTable.Columns.Contains(sourceColumn))
                throw new ArgumentException($"Source column '{sourceColumn}' does not exist in the data table.");

            var groupCols = PartitionHelper.ParseColumns(groupByColumns);
            PartitionHelper.ValidateColumns(dataTable, groupCols);
            if (groupCols.Count == 0)
                throw new ArgumentException("Group By Columns cannot be empty.");
            if (!string.IsNullOrWhiteSpace(orderByColumn) && !dataTable.Columns.Contains(orderByColumn))
                throw new ArgumentException($"Order By column '{orderByColumn}' does not exist in the data table.");

            var result = dataTable.Copy();
            var resultColumn = string.IsNullOrWhiteSpace(resultColumnName) ? $"{sourceColumn}_LastValue" : resultColumnName.Trim();
            if (!result.Columns.Contains(resultColumn))
                result.Columns.Add(resultColumn, typeof(object));

            var groups = result.AsEnumerable().GroupBy(row => PartitionHelper.BuildKey(row, groupCols));
            foreach (var group in groups)
            {
                IEnumerable<DataRow> ordered = group;
                if (!string.IsNullOrWhiteSpace(orderByColumn))
                    ordered = group.OrderBy(r => WindowingHelper.NormalizeForOrder(r[orderByColumn]), new ValueComparer(ascending));

                var lastRow = ordered.LastOrDefault();
                var lastValue = lastRow?[sourceColumn];
                foreach (var row in group)
                    row[resultColumn] = lastValue ?? DBNull.Value;
            }

            ResultDataTable.Set(context, result);
            status = "Successfully computed last value by group.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ResultDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error computing last value by group: {ex.Message}");
        }
    }

    private sealed class ValueComparer : IComparer<object>
    {
        private readonly bool _ascending;
        public ValueComparer(bool ascending) => _ascending = ascending;
        public int Compare(object? x, object? y)
        {
            var result = WindowingHelper.CompareNormalized(x, y);
            return _ascending ? result : -result;
        }
    }
}
