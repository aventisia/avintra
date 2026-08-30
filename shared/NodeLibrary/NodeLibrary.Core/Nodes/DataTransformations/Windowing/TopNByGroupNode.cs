using System.Data;
using NodeLibrary.DataTableNodes.Helpers;

namespace NodeLibrary.WindowingNodes;

[DisplayName("Top N By Group"), Description("Filters the data table to keep only the top N rows (by an ordering column) within each group.")]
[NodeMetadata(icon: "/assets/Windowing.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class TopNByGroupNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to filter.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Group By Columns"), Description("Comma-separated columns that define the groups.")]
    public required InArgument<string> GroupByColumns { get; set; }

    [DisplayName("Order By Column"), Description("The column used to determine which rows are the top N.")]
    public required InArgument<string> OrderByColumn { get; set; }

    [DisplayName("Ascending"), Description("True to keep the smallest N values, false for the largest N. Defaults to false (largest).")]
    public InArgument<bool> Ascending { get; set; } = new InArgument<bool>(false);

    [DisplayName("N"), Description("The number of top rows to keep per group. Defaults to 1.")]
    public InArgument<int> N { get; set; } = new InArgument<int>(1);

    [DisplayName("Result Data Table"), Description("The filtered data table.")]
    public OutArgument<DataTable> ResultDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var groupByColumns = GroupByColumns.Get(context);
            var orderByColumn = OrderByColumn.Get(context);
            var ascending = Ascending.Get(context);
            var n = N.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(orderByColumn) || !dataTable.Columns.Contains(orderByColumn))
                throw new ArgumentException($"Order By column '{orderByColumn}' does not exist in the data table.");
            if (n <= 0)
                throw new ArgumentException("N must be greater than zero.");

            var groupCols = PartitionHelper.ParseColumns(groupByColumns);
            PartitionHelper.ValidateColumns(dataTable, groupCols);
            if (groupCols.Count == 0)
                throw new ArgumentException("Group By Columns cannot be empty.");

            var result = dataTable.Clone();
            var groups = dataTable.AsEnumerable().GroupBy(row => PartitionHelper.BuildKey(row, groupCols));
            foreach (var group in groups)
            {
                var top = group
                    .OrderBy(r => WindowingHelper.NormalizeForOrder(r[orderByColumn]), new ValueComparer(ascending))
                    .Take(n);
                foreach (var row in top)
                    result.ImportRow(row);
            }

            ResultDataTable.Set(context, result);
            status = $"Successfully kept the top {n} rows per group.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ResultDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error computing top N by group: {ex.Message}");
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
