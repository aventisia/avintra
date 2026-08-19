using System.Data;
using NodeLibrary.DataTableNodes.Helpers;

namespace NodeLibrary.DataQualityNodes;

[DisplayName("Remove Outliers"), Description("Removes rows whose value in a numeric column is flagged as an outlier using the IQR or Z-score method. Computed per optional group columns.")]
[NodeMetadata(icon: "/assets/DataQuality.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class RemoveOutliersNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table containing the numeric column to analyze.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Value Column"), Description("The numeric column used to determine outliers.")]
    public required InArgument<string> ValueColumn { get; set; }

    [DisplayName("Method"), Description("The detection method: 'IQR' or 'ZScore'. Defaults to 'IQR'.")]
    public InArgument<string> Method { get; set; } = new InArgument<string>("IQR");

    [DisplayName("Threshold"), Description("The IQR multiplier (e.g. 1.5) or Z-score cutoff (e.g. 3) depending on method. Defaults to 1.5.")]
    public InArgument<decimal> Threshold { get; set; } = new InArgument<decimal>(1.5m);

    [DisplayName("Group By Columns"), Description("Optional comma-separated columns to compute outlier statistics within. Leave empty to use the whole table.")]
    public InArgument<string> GroupByColumns { get; set; } = new InArgument<string>();

    [DisplayName("Cleaned Data Table"), Description("The resulting data table with outlier rows removed.")]
    public OutArgument<DataTable> CleanedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var valueColumn = ValueColumn.Get(context);
            var method = Method.Get(context);
            var threshold = Threshold.Get(context);
            var groupByColumns = GroupByColumns.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(valueColumn) || !dataTable.Columns.Contains(valueColumn))
                throw new ArgumentException($"Value column '{valueColumn}' does not exist in the data table.");

            var useIqr = method.Equals("IQR", StringComparison.OrdinalIgnoreCase);
            if (!useIqr && !method.Equals("ZScore", StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("Method must be 'IQR' or 'ZScore'.");

            var groupCols = string.IsNullOrWhiteSpace(groupByColumns)
                ? new List<string>()
                : groupByColumns.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

            var keep = new List<DataRow>();
            var rows = dataTable.AsEnumerable().ToList();

            if (groupCols.Count == 0)
            {
                keep.AddRange(rows.Where(r => !IsOutlier(rows, r, valueColumn, useIqr, threshold)));
            }
            else
            {
                var groups = rows.GroupBy(row => string.Join("\u0001", groupCols.Select(c => row[c]?.ToString() ?? "")));
                foreach (var group in groups)
                {
                    var groupRows = group.ToList();
                    foreach (var row in groupRows)
                        if (!IsOutlier(groupRows, row, valueColumn, useIqr, threshold))
                            keep.Add(row);
                }
            }

            var result = dataTable.Clone();
            foreach (var row in keep)
                result.ImportRow(row);

            CleanedDataTable.Set(context, result);
            status = $"Removed {dataTable.Rows.Count - result.Rows.Count} outlier rows.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            CleanedDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error removing outliers: {ex.Message}");
        }
    }

    private static bool IsOutlier(List<DataRow> rows, DataRow row, string valueColumn, bool useIqr, decimal threshold)
    {
        var values = StatisticsHelper.ToDecimals(rows.Select(r => r[valueColumn]));
        if (values.Count == 0)
            return false;

        var d = StatisticsHelper.ToDecimals(new[] { row[valueColumn] });
        if (d.Count == 0)
            return false;
        var v = d[0];

        if (useIqr)
        {
            var sorted = values.OrderBy(x => x).ToList();
            var q1 = Percentile(sorted, 25m);
            var q3 = Percentile(sorted, 75m);
            var iqr = q3 - q1;
            return v < q1 - threshold * iqr || v > q3 + threshold * iqr;
        }

        var mean = values.Average();
        var sd = StatisticsHelper.StandardDeviation(values, sample: true);
        if (!sd.HasValue || sd.Value == 0m)
            return false;
        return Math.Abs((double)((v - mean) / sd.Value)) > (double)threshold;
    }

    private static decimal Percentile(List<decimal> sorted, decimal percentile)
    {
        var rank = (percentile / 100m) * (sorted.Count - 1);
        var lower = (int)Math.Floor(rank);
        var upper = (int)Math.Ceiling(rank);
        if (lower == upper)
            return sorted[lower];
        var fraction = rank - lower;
        return sorted[lower] + (sorted[upper] - sorted[lower]) * fraction;
    }
}
