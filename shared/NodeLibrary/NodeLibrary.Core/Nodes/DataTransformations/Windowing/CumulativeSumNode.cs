using System.Data;
using NodeLibrary.DataTableNodes.Helpers;

namespace NodeLibrary.WindowingNodes;

[DisplayName("Cumulative Sum"), Description("Adds a column with the running total of a numeric column. The running total restarts for each partition.")]
[NodeMetadata(icon: "/assets/Windowing.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class CumulativeSumNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to compute the cumulative sum for.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Value Column"), Description("The numeric column to sum cumulatively.")]
    public required InArgument<string> ValueColumn { get; set; }

    [DisplayName("Partition By Columns"), Description("Optional comma-separated columns that define partitions. The running total restarts per partition.")]
    public InArgument<string> PartitionByColumns { get; set; } = new InArgument<string>();

    [DisplayName("Result Column Name"), Description("The name of the cumulative sum column. Defaults to '<ValueColumn>_CumulativeSum'.")]
    public InArgument<string> ResultColumnName { get; set; } = new InArgument<string>();

    [DisplayName("Result Data Table"), Description("The resulting data table.")]
    public OutArgument<DataTable> ResultDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var valueColumn = ValueColumn.Get(context);
            var partitionByColumns = PartitionByColumns.Get(context);
            var resultColumnName = ResultColumnName.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(valueColumn) || !dataTable.Columns.Contains(valueColumn))
                throw new ArgumentException($"Value column '{valueColumn}' does not exist in the data table.");

            var result = dataTable.Copy();
            var resultColumn = string.IsNullOrWhiteSpace(resultColumnName) ? $"{valueColumn}_CumulativeSum" : resultColumnName.Trim();
            if (!result.Columns.Contains(resultColumn))
                result.Columns.Add(resultColumn, typeof(object));

            var partitionCols = PartitionHelper.ParseColumns(partitionByColumns);
            PartitionHelper.ValidateColumns(result, partitionCols);

            var partitions = result.AsEnumerable().GroupBy(row => PartitionHelper.BuildKey(row, partitionCols));
            foreach (var partition in partitions)
            {
                decimal runningTotal = 0m;
                foreach (var row in partition)
                {
                    var decimals = StatisticsHelper.ToDecimals(new[] { row[valueColumn] });
                    if (decimals.Count > 0)
                        runningTotal += decimals[0];
                    row[resultColumn] = runningTotal;
                }
            }

            ResultDataTable.Set(context, result);
            status = "Successfully computed the cumulative sum.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ResultDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error computing cumulative sum: {ex.Message}");
        }
    }
}
