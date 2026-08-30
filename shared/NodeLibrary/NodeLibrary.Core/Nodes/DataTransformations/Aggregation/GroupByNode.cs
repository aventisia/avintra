using System.Data;
using NodeLibrary.DataTableNodes.Enums;
using NodeLibrary.DataTableNodes.Helpers;

namespace NodeLibrary.AggregationNodes;

[DisplayName("Group By"), Description("Groups rows by one or more columns and applies multiple aggregation functions to one or more value columns. Aggregations are specified as JSON, e.g. [{\"Column\":\"Sales\",\"Aggregation\":\"Sum\",\"Result\":\"TotalSales\"}].")]
[NodeMetadata(icon: "/assets/Aggregation.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class GroupByNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to group and aggregate.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Group By Columns"), Description("Comma-separated column names used to group rows.")]
    public required InArgument<string> GroupByColumns { get; set; }

    [DisplayName("Aggregations (JSON)"), Description("JSON array of aggregation definitions: [{ \"Column\": string, \"Aggregation\": string, \"Result\": string }].")]
    public required InArgument<string> AggregationsJson { get; set; }

    [DisplayName("Grouped Data Table"), Description("The resulting grouped and aggregated data table.")]
    public OutArgument<DataTable> GroupedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var groupByColumns = GroupByColumns.Get(context);
            var aggregationsJson = AggregationsJson.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(groupByColumns))
                throw new ArgumentException("Group By Columns cannot be empty.");
            if (string.IsNullOrWhiteSpace(aggregationsJson))
                throw new ArgumentException("Aggregations JSON cannot be empty.");

            var groupCols = groupByColumns
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToList();

            foreach (var groupCol in groupCols)
                if (!dataTable.Columns.Contains(groupCol))
                    throw new ArgumentException($"Group By column '{groupCol}' does not exist in the data table.");

            var defs = ParseAggregations(aggregationsJson);
            foreach (var def in defs)
            {
                if (!dataTable.Columns.Contains(def.Column))
                    throw new ArgumentException($"Value column '{def.Column}' does not exist in the data table.");
                if (!Enum.TryParse<AggregateOperationEnum>(def.Aggregation, ignoreCase: true, out _))
                    throw new ArgumentException($"Aggregation '{def.Aggregation}' is not supported.");
            }

            var resultTable = new DataTable();
            foreach (var groupCol in groupCols)
                resultTable.Columns.Add(groupCol, typeof(string));
            foreach (var def in defs)
                resultTable.Columns.Add(def.Result, typeof(object));

            var groups = dataTable.AsEnumerable().GroupBy(row => string.Join("\u0001", groupCols.Select(c => row[c]?.ToString() ?? "")));
            foreach (var group in groups)
            {
                var newRow = resultTable.NewRow();
                var keys = group.Key.Split('\u0001');
                for (var i = 0; i < groupCols.Count; i++)
                    newRow[groupCols[i]] = keys[i];

                foreach (var def in defs)
                {
                    var values = group.Select(row => row[def.Column]).Where(v => v != null && v != DBNull.Value).Cast<object?>().ToList();
                    newRow[def.Result] = AggregateValue(values, Enum.Parse<AggregateOperationEnum>(def.Aggregation, ignoreCase: true));
                }
                resultTable.Rows.Add(newRow);
            }

            GroupedDataTable.Set(context, resultTable);
            status = $"Successfully grouped data table into {resultTable.Rows.Count} groups.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            GroupedDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error grouping data table: {ex.Message}");
        }
    }

    private static List<AggregationDef> ParseAggregations(string json)
    {
        var defs = new List<AggregationDef>();
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;
        var array = root.ValueKind == JsonValueKind.Array ? root : root.GetProperty("aggregations");
        foreach (var item in array.EnumerateArray())
        {
            var def = new AggregationDef
            {
                Column = item.GetProperty("Column").GetString() ?? "",
                Aggregation = item.GetProperty("Aggregation").GetString() ?? "",
                Result = item.TryGetProperty("Result", out var r) && r.ValueKind == JsonValueKind.String ? r.GetString()! : ""
            };
            if (string.IsNullOrWhiteSpace(def.Result))
                def.Result = def.Column;
            defs.Add(def);
        }
        return defs;
    }

    private static object? AggregateValue(List<object?> values, AggregateOperationEnum aggregation)
    {
        switch (aggregation)
        {
            case AggregateOperationEnum.Count:
                return values.Count;
            case AggregateOperationEnum.CountDistinct:
                return values.Select(v => v?.ToString()).Distinct().Count();
            case AggregateOperationEnum.First:
                return values.FirstOrDefault();
            case AggregateOperationEnum.Last:
                return values.LastOrDefault();
            case AggregateOperationEnum.Mode:
                return StatisticsHelper.Mode(values);
            case AggregateOperationEnum.GeometricMean:
                return StatisticsHelper.GeometricMean(values);
            case AggregateOperationEnum.HarmonicMean:
                return StatisticsHelper.HarmonicMean(values);
            case AggregateOperationEnum.Variance:
                return StatisticsHelper.Variance(values, sample: true);
            case AggregateOperationEnum.PopulationStandardDeviation:
                return StatisticsHelper.StandardDeviation(values, sample: false);
            case AggregateOperationEnum.Skewness:
                return StatisticsHelper.Skewness(values);
            case AggregateOperationEnum.Kurtosis:
                return StatisticsHelper.Kurtosis(values);
            default:
                break;
        }

        var decimals = StatisticsHelper.ToDecimals(values);
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
                return StatisticsHelper.StandardDeviation(values, sample: true);
            case AggregateOperationEnum.Percentile:
                return StatisticsHelper.Percentile(values, 50m);
            case AggregateOperationEnum.WeightedAverage:
                return StatisticsHelper.WeightedAverage(values, values);
            case AggregateOperationEnum.Min:
                return decimals.Min();
            case AggregateOperationEnum.Max:
                return decimals.Max();
            default:
                throw new ArgumentOutOfRangeException(nameof(aggregation));
        }
    }

    private sealed class AggregationDef
    {
        public string Column { get; set; } = "";
        public string Aggregation { get; set; } = "";
        public string Result { get; set; } = "";
    }
}
