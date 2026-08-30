using System.Data;
using NodeLibrary.DataTableNodes.Helpers;

namespace NodeLibrary.DataQualityNodes;

[DisplayName("Impute by Median"), Description("Replaces missing (null) values in one or more numeric columns with the median of each column. Computed per optional group columns.")]
[NodeMetadata(icon: "/assets/DataQuality.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class ImputeByMedianNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table containing the columns to impute.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Columns To Impute"), Description("Comma-separated numeric column names whose null values are replaced with the median.")]
    public required InArgument<string> ColumnsToImpute { get; set; }

    [DisplayName("Group By Columns"), Description("Optional comma-separated columns to compute the median within. Leave empty to use the whole table.")]
    public InArgument<string> GroupByColumns { get; set; } = new InArgument<string>();

    [DisplayName("Imputed Data Table"), Description("The resulting data table with imputed values.")]
    public OutArgument<DataTable> ImputedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var columnsToImpute = ColumnsToImpute.Get(context) ?? string.Empty;
            var groupByColumns = GroupByColumns.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");

            var cols = columnsToImpute.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
            foreach (var col in cols)
                if (!dataTable.Columns.Contains(col))
                    throw new ArgumentException($"Column '{col}' does not exist in the data table.");

            var groupCols = string.IsNullOrWhiteSpace(groupByColumns)
                ? new List<string>()
                : groupByColumns.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

            var result = dataTable.Copy();
            var rows = result.AsEnumerable().ToList();

            if (groupCols.Count == 0)
            {
                foreach (var col in cols)
                {
                    var values = StatisticsHelper.ToDecimals(rows.Select(r => r[col]));
                    var median = ComputeMedian(values);
                    if (!median.HasValue)
                        continue;
                    foreach (var row in rows)
                        if (row[col] == DBNull.Value || row[col] == null)
                            row[col] = median.Value;
                }
            }
            else
            {
                var groups = rows.GroupBy(row => string.Join("\u0001", groupCols.Select(c => row[c]?.ToString() ?? "")));
                foreach (var group in groups)
                {
                    foreach (var col in cols)
                    {
                        var values = StatisticsHelper.ToDecimals(group.Select(r => r[col]));
                        var median = ComputeMedian(values);
                        if (!median.HasValue)
                            continue;
                        foreach (var row in group)
                            if (row[col] == DBNull.Value || row[col] == null)
                                row[col] = median.Value;
                    }
                }
            }

            ImputedDataTable.Set(context, result);
            status = "Successfully imputed missing values with the median.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ImputedDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error imputing by median: {ex.Message}");
        }
    }

    private static decimal? ComputeMedian(List<decimal> values)
    {
        if (values.Count == 0)
            return null;
        values.Sort();
        var mid = values.Count / 2;
        return values.Count % 2 != 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2m;
    }
}
