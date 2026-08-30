using System.Data;
using NodeLibrary.DataTableNodes.Helpers;

namespace NodeLibrary.AggregationNodes;

[DisplayName("Weighted Average"), Description("Adds a column containing the weighted average of a value column, using a separate weights column. Results can be per group or whole-table.")]
[NodeMetadata(icon: "/assets/Aggregation.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class WeightedAverageNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to compute the weighted average for.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Value Column"), Description("The numeric column to average.")]
    public required InArgument<string> ValueColumn { get; set; }

    [DisplayName("Weights Column"), Description("The numeric column holding the weights.")]
    public required InArgument<string> WeightsColumn { get; set; }

    [DisplayName("Group By Columns"), Description("Optional comma-separated columns to group by. Leave empty to use the whole table.")]
    public InArgument<string> GroupByColumns { get; set; } = new InArgument<string>();

    [DisplayName("Result Column Name"), Description("The name of the result column. Defaults to '<ValueColumn>_WeightedAvg'.")]
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
            var weightsColumn = WeightsColumn.Get(context);
            var groupByColumns = GroupByColumns.Get(context);
            var resultColumnName = ResultColumnName.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(valueColumn) || !dataTable.Columns.Contains(valueColumn))
                throw new ArgumentException($"Value column '{valueColumn}' does not exist in the data table.");
            if (string.IsNullOrWhiteSpace(weightsColumn) || !dataTable.Columns.Contains(weightsColumn))
                throw new ArgumentException($"Weights column '{weightsColumn}' does not exist in the data table.");

            var result = dataTable.Copy();
            var resultColumn = string.IsNullOrWhiteSpace(resultColumnName) ? $"{valueColumn}_WeightedAvg" : resultColumnName.Trim();
            if (!result.Columns.Contains(resultColumn))
                result.Columns.Add(resultColumn, typeof(object));

            var groupCols = string.IsNullOrWhiteSpace(groupByColumns)
                ? new List<string>()
                : groupByColumns.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

            if (groupCols.Count == 0)
            {
                var value = StatisticsHelper.WeightedAverage(
                    result.AsEnumerable().Select(r => r[valueColumn]),
                    result.AsEnumerable().Select(r => r[weightsColumn]));
                foreach (var row in result.Rows.OfType<DataRow>())
                    row[resultColumn] = (object?)value ?? DBNull.Value;
            }
            else
            {
                var groups = result.AsEnumerable().GroupBy(row => string.Join("\u0001", groupCols.Select(c => row[c]?.ToString() ?? "")));
                foreach (var group in groups)
                {
                    var value = StatisticsHelper.WeightedAverage(
                        group.Select(r => r[valueColumn]),
                        group.Select(r => r[weightsColumn]));
                    foreach (var row in group)
                        row[resultColumn] = (object?)value ?? DBNull.Value;
                }
            }

            ResultDataTable.Set(context, result);
            status = "Successfully computed the weighted average.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ResultDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error computing weighted average: {ex.Message}");
        }
    }
}
