using System.Data;
using NodeLibrary.DataTableNodes.Helpers;

namespace NodeLibrary.WindowingNodes;

[DisplayName("Percent Rank"), Description("Adds a column with the relative rank (0 to 1) of each row within a partition, based on an ordering column.")]
[NodeMetadata(icon: "/assets/Windowing.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class PercentRankNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to compute percent rank for.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Order By Column"), Description("The column used to determine the ordering.")]
    public required InArgument<string> OrderByColumn { get; set; }

    [DisplayName("Ascending"), Description("True to order in ascending order, false for descending. Defaults to true.")]
    public InArgument<bool> Ascending { get; set; } = new InArgument<bool>(true);

    [DisplayName("Partition By Columns"), Description("Optional comma-separated columns that define partitions. Percent rank restarts per partition.")]
    public InArgument<string> PartitionByColumns { get; set; } = new InArgument<string>();

    [DisplayName("Result Column Name"), Description("The name of the percent rank column. Defaults to 'PercentRank'.")]
    public InArgument<string> ResultColumnName { get; set; } = new InArgument<string>();

    [DisplayName("Result Data Table"), Description("The resulting data table.")]
    public OutArgument<DataTable> ResultDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var orderByColumn = OrderByColumn.Get(context);
            var ascending = Ascending.Get(context);
            var partitionByColumns = PartitionByColumns.Get(context);
            var resultColumnName = ResultColumnName.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(orderByColumn) || !dataTable.Columns.Contains(orderByColumn))
                throw new ArgumentException($"Order By column '{orderByColumn}' does not exist in the data table.");

            var result = dataTable.Copy();
            var resultColumn = string.IsNullOrWhiteSpace(resultColumnName) ? "PercentRank" : resultColumnName.Trim();
            if (!result.Columns.Contains(resultColumn))
                result.Columns.Add(resultColumn, typeof(decimal));

            var partitionCols = PartitionHelper.ParseColumns(partitionByColumns);
            PartitionHelper.ValidateColumns(result, partitionCols);

            var partitions = result.AsEnumerable().GroupBy(row => PartitionHelper.BuildKey(row, partitionCols));
            foreach (var partition in partitions)
            {
                var ordered = partition
                    .Select(r => new { Row = r, Value = WindowingHelper.NormalizeForOrder(r[orderByColumn]) })
                    .OrderBy(x => x.Value, new ValueComparer(ascending))
                    .ToList();

                var n = ordered.Count;
                // Assign a rank based on position; ties get the first position.
                var rankByIndex = new Dictionary<DataRow, int>();
                var rank = 1;
                for (var i = 0; i < n; i++)
                {
                    if (i > 0 && WindowingHelper.CompareNormalized(ordered[i].Value, ordered[i - 1].Value) != 0)
                        rank = i + 1;
                    rankByIndex[ordered[i].Row] = rank;
                }

                foreach (var item in ordered)
                    item.Row[resultColumn] = n <= 1 ? 0m : (decimal)(rankByIndex[item.Row] - 1) / (n - 1);
            }

            ResultDataTable.Set(context, result);
            status = "Successfully computed percent rank.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ResultDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error computing percent rank: {ex.Message}");
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
