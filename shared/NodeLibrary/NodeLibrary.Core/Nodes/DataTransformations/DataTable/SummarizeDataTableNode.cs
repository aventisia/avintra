using System.Data;
using NodeLibrary.DataTableNodes.Enums;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Summarize Data Table"), Description("Groups rows by one or more columns and applies aggregation functions such as Sum, Count, Minimum, Maximum, or Average.")]
[NodeMetadata(icon: "/assets/DataTable.svg", badge: "Beta")]
public class SummarizeDataTableNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to summarize.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Group By Columns"), Description("Comma-separated column names used to group rows.")]
    public required InArgument<string> GroupByColumns { get; set; }

    [DisplayName("Value Column"), Description("The column on which the aggregation is performed.")]
    public required InArgument<string> ValueColumn { get; set; }

    [DisplayName("Aggregation"), Description("The aggregation function to apply to the value column.")]
    public required InArgument<AggregateOperationEnum> Aggregation { get; set; } = new InArgument<AggregateOperationEnum>(AggregateOperationEnum.Sum);

    [DisplayName("Result Column Name"), Description("The name of the column that will hold the aggregated result. Defaults to the value column name.")]
    public InArgument<string> ResultColumnName { get; set; } = new InArgument<string>();

    [DisplayName("Summarized Data Table"), Description("The resulting grouped and aggregated data table.")]
    public OutArgument<DataTable> SummarizedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var groupByColumns = GroupByColumns.Get(context);
            var valueColumn = ValueColumn.Get(context);
            var aggregation = Aggregation.Get(context);
            var resultColumnName = ResultColumnName.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(groupByColumns))
                throw new ArgumentException("Group By Columns cannot be empty.");
            if (string.IsNullOrWhiteSpace(valueColumn))
                throw new ArgumentException("Value Column cannot be empty.");
            if (!dataTable.Columns.Contains(valueColumn))
                throw new ArgumentException($"Value column '{valueColumn}' does not exist in the data table.");

            var groupCols = groupByColumns
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToList();

            foreach (var groupCol in groupCols)
            {
                if (!dataTable.Columns.Contains(groupCol))
                    throw new ArgumentException($"Group By column '{groupCol}' does not exist in the data table.");
            }

            var resultColumn = string.IsNullOrWhiteSpace(resultColumnName) ? valueColumn : resultColumnName.Trim();
            var resultTable = new DataTable();
            foreach (var groupCol in groupCols)
                resultTable.Columns.Add(groupCol, typeof(string));
            resultTable.Columns.Add(resultColumn, typeof(object));

            var groups = dataTable.AsEnumerable().GroupBy(row => string.Join("\u0001", groupCols.Select(c => row[c]?.ToString() ?? "")));
            foreach (var group in groups)
            {
                var values = group.Select(row => row[valueColumn]).Where(v => v != null && v != DBNull.Value).ToList();
                var aggregated = Aggregate(values, aggregation, resultColumn);
                var newRow = resultTable.NewRow();
                var keys = group.Key.Split('\u0001');
                for (var i = 0; i < groupCols.Count; i++)
                    newRow[groupCols[i]] = keys[i];
                newRow[resultColumn] = aggregated;
                resultTable.Rows.Add(newRow);
            }

            SummarizedDataTable.Set(context, resultTable);
            status = $"Successfully summarized data table into {resultTable.Rows.Count} groups.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            SummarizedDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error summarizing data table: {ex.Message}");
        }
    }

    private static object? Aggregate(List<object> values, AggregateOperationEnum aggregation, string resultColumn)
    {
        switch (aggregation)
        {
            case AggregateOperationEnum.Count:
                return values.Count;
            case AggregateOperationEnum.CountDistinct:
                return values.Select(v => v.ToString()).Distinct().Count();
            case AggregateOperationEnum.First:
                return values.FirstOrDefault();
            case AggregateOperationEnum.Last:
                return values.LastOrDefault();
            case AggregateOperationEnum.Sum:
            case AggregateOperationEnum.Average:
            case AggregateOperationEnum.Median:
            case AggregateOperationEnum.StandardDeviation:
                {
                    var decimals = values.Select(v => Convert.ToDecimal(v, CultureInfo.InvariantCulture)).ToList();
                    if (decimals.Count == 0)
                        return null;
                    switch (aggregation)
                    {
                        case AggregateOperationEnum.Sum:
                            return decimals.Sum();
                        case AggregateOperationEnum.Average:
                            return decimals.Average();
                        case AggregateOperationEnum.Median:
                            decimals.Sort();
                            var mid = decimals.Count / 2;
                            return decimals.Count % 2 != 0 ? decimals[mid] : (decimals[mid - 1] + decimals[mid]) / 2m;
                        case AggregateOperationEnum.StandardDeviation:
                            var avg = decimals.Average();
                            var variance = decimals.Sum(d => (d - avg) * (d - avg)) / (decimals.Count - 1);
                            return Math.Sqrt((double)variance);
                    }
                    break;
                }
            case AggregateOperationEnum.Min:
                return values.Select(v => Convert.ToDecimal(v, CultureInfo.InvariantCulture)).DefaultIfEmpty(0m).Min();
            case AggregateOperationEnum.Max:
                return values.Select(v => Convert.ToDecimal(v, CultureInfo.InvariantCulture)).DefaultIfEmpty(0m).Max();
            default:
                throw new ArgumentOutOfRangeException(nameof(aggregation));
        }
        return null;
    }
}
