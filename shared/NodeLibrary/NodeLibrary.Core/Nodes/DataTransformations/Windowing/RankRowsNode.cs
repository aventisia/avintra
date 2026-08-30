using System.Data;
using NodeLibrary.DataTableNodes.Helpers;

namespace NodeLibrary.WindowingNodes;

[DisplayName("Rank Rows"), Description("Adds a column with the rank of rows within partitions based on an ordering column. Supports ascending/descending order and dense or standard ranking.")]
[NodeMetadata(icon: "/assets/Windowing.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class RankRowsNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to rank rows for.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Order By Column"), Description("The column used to determine the ranking order.")]
    public required InArgument<string> OrderByColumn { get; set; }

    [DisplayName("Ascending"), Description("True to rank in ascending order, false for descending. Defaults to true.")]
    public InArgument<bool> Ascending { get; set; } = new InArgument<bool>(true);

    [DisplayName("Dense Rank"), Description("True to use dense ranking (no gaps), false for standard ranking (gaps). Defaults to false.")]
    public InArgument<bool> DenseRank { get; set; } = new InArgument<bool>(false);

    [DisplayName("Partition By Columns"), Description("Optional comma-separated columns that define partitions. Ranking restarts per partition.")]
    public InArgument<string> PartitionByColumns { get; set; } = new InArgument<string>();

    [DisplayName("Result Column Name"), Description("The name of the rank column. Defaults to 'Rank'.")]
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
            var denseRank = DenseRank.Get(context);
            var partitionByColumns = PartitionByColumns.Get(context);
            var resultColumnName = ResultColumnName.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(orderByColumn) || !dataTable.Columns.Contains(orderByColumn))
                throw new ArgumentException($"Order By column '{orderByColumn}' does not exist in the data table.");

            var result = dataTable.Copy();
            var resultColumn = string.IsNullOrWhiteSpace(resultColumnName) ? "Rank" : resultColumnName.Trim();
            if (!result.Columns.Contains(resultColumn))
                result.Columns.Add(resultColumn, typeof(long));

            var partitionCols = string.IsNullOrWhiteSpace(partitionByColumns)
                ? new List<string>()
                : partitionByColumns.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

            IEnumerable<IGrouping<string, DataRow>> partitions;
            if (partitionCols.Count == 0)
            {
                partitions = new[] { result.AsEnumerable().GroupBy(r => "all").First() };
            }
            else
            {
                partitions = result.AsEnumerable().GroupBy(row => string.Join("\u0001", partitionCols.Select(c => row[c]?.ToString() ?? "")));
            }

            foreach (var partition in partitions)
            {
                var ordered = partition
                    .Select(r => new { Row = r, Value = WindowingHelper.NormalizeForOrder(r[orderByColumn]) })
                    .OrderBy(x => x.Value, new ValueComparer(ascending))
                    .ToList();

                long rank = 1;
                long nextRank = 2;
                for (var i = 0; i < ordered.Count; i++)
                {
                    if (i > 0 && WindowingHelper.CompareNormalized(ordered[i].Value, ordered[i - 1].Value) != 0)
                    {
                        rank = denseRank ? rank + 1 : nextRank;
                    }
                    ordered[i].Row[resultColumn] = rank;
                    nextRank++;
                }
            }

            ResultDataTable.Set(context, result);
            status = "Successfully ranked rows.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ResultDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error ranking rows: {ex.Message}");
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
