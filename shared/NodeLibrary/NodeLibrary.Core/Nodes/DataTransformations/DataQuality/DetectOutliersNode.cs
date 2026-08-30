using System.Data;
using NodeLibrary.DataTableNodes.Helpers;

namespace NodeLibrary.DataQualityNodes;

[DisplayName("Detect Outliers"), Description("Adds a boolean column flagging numeric outliers in a value column using the IQR or Z-score method. Computed per optional group columns.")]
[NodeMetadata(icon: "/assets/DataQuality.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class DetectOutliersNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table containing the numeric column to analyze.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Value Column"), Description("The numeric column to detect outliers in.")]
    public required InArgument<string> ValueColumn { get; set; }

    [DisplayName("Method"), Description("The detection method: 'IQR' or 'ZScore'. Defaults to 'IQR'.")]
    public InArgument<string> Method { get; set; } = new InArgument<string>("IQR");

    [DisplayName("Threshold"), Description("The IQR multiplier (e.g. 1.5) or Z-score cutoff (e.g. 3) depending on method. Defaults to 1.5.")]
    public InArgument<decimal> Threshold { get; set; } = new InArgument<decimal>(1.5m);

    [DisplayName("Group By Columns"), Description("Optional comma-separated columns to compute outlier statistics within. Leave empty to use the whole table.")]
    public InArgument<string> GroupByColumns { get; set; } = new InArgument<string>();

    [DisplayName("Result Column Name"), Description("The name of the outlier flag column. Defaults to '<ValueColumn>_IsOutlier'.")]
    public InArgument<string> ResultColumnName { get; set; } = new InArgument<string>();

    [DisplayName("Result Data Table"), Description("The resulting data table with the outlier flag column.")]
    public OutArgument<DataTable> ResultDataTable { get; set; } = new OutArgument<DataTable>();

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
            var resultColumnName = ResultColumnName.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(valueColumn) || !dataTable.Columns.Contains(valueColumn))
                throw new ArgumentException($"Value column '{valueColumn}' does not exist in the data table.");

            var useIqr = method.Equals("IQR", StringComparison.OrdinalIgnoreCase);
            if (!useIqr && !method.Equals("ZScore", StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("Method must be 'IQR' or 'ZScore'.");

            var result = dataTable.Copy();
            var resultColumn = string.IsNullOrWhiteSpace(resultColumnName) ? $"{valueColumn}_IsOutlier" : resultColumnName.Trim();
            if (!result.Columns.Contains(resultColumn))
                result.Columns.Add(resultColumn, typeof(bool));

            var groupCols = string.IsNullOrWhiteSpace(groupByColumns)
                ? new List<string>()
                : groupByColumns.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

            var rows = result.AsEnumerable().ToList();
            if (groupCols.Count == 0)
            {
                FlagOutliers(rows, valueColumn, resultColumn, useIqr, threshold);
            }
            else
            {
                var groups = rows.GroupBy(row => string.Join("\u0001", groupCols.Select(c => row[c]?.ToString() ?? "")));
                foreach (var group in groups)
                    FlagOutliers(group.ToList(), valueColumn, resultColumn, useIqr, threshold);
            }

            ResultDataTable.Set(context, result);
            status = "Successfully detected outliers.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ResultDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error detecting outliers: {ex.Message}");
        }
    }

    private static void FlagOutliers(List<DataRow> rows, string valueColumn, string resultColumn, bool useIqr, decimal threshold)
    {
        var values = StatisticsHelper.ToDecimals(rows.Select(r => r[valueColumn]));
        if (values.Count == 0)
            return;

        if (useIqr)
        {
            var sorted = values.OrderBy(v => v).ToList();
            var q1 = Percentile(sorted, 25m);
            var q3 = Percentile(sorted, 75m);
            var iqr = q3 - q1;
            var lower = q1 - threshold * iqr;
            var upper = q3 + threshold * iqr;

            foreach (var row in rows)
            {
                var d = StatisticsHelper.ToDecimals(new[] { row[valueColumn] });
                row[resultColumn] = d.Count > 0 && (d[0] < lower || d[0] > upper);
            }
        }
        else
        {
            var mean = values.Average();
            var sd = StatisticsHelper.StandardDeviation(values, sample: true);
            if (!sd.HasValue || sd.Value == 0m)
            {
                foreach (var row in rows)
                    row[resultColumn] = false;
                return;
            }

            foreach (var row in rows)
            {
                var d = StatisticsHelper.ToDecimals(new[] { row[valueColumn] });
                row[resultColumn] = d.Count > 0 && Math.Abs((double)((d[0] - mean) / sd.Value)) > (double)threshold;
            }
        }
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
