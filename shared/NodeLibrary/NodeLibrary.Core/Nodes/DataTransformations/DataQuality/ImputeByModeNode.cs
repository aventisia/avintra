using System.Data;
using NodeLibrary.DataTableNodes.Helpers;

namespace NodeLibrary.DataQualityNodes;

[DisplayName("Impute by Mode"), Description("Replaces missing (null) values in one or more columns with the most frequently occurring value of each column. Computed per optional group columns.")]
[NodeMetadata(icon: "/assets/DataQuality.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class ImputeByModeNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table containing the columns to impute.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Columns To Impute"), Description("Comma-separated column names whose null values are replaced with the mode.")]
    public required InArgument<string> ColumnsToImpute { get; set; }

    [DisplayName("Group By Columns"), Description("Optional comma-separated columns to compute the mode within. Leave empty to use the whole table.")]
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
                    var mode = ComputeMode(rows, col);
                    if (mode == null)
                        continue;
                    foreach (var row in rows)
                        if (row[col] == DBNull.Value || row[col] == null)
                            row[col] = mode;
                }
            }
            else
            {
                var groups = rows.GroupBy(row => string.Join("\u0001", groupCols.Select(c => row[c]?.ToString() ?? "")));
                foreach (var group in groups)
                {
                    foreach (var col in cols)
                    {
                        var mode = ComputeMode(group.ToList(), col);
                        if (mode == null)
                            continue;
                        foreach (var row in group)
                            if (row[col] == DBNull.Value || row[col] == null)
                                row[col] = mode;
                    }
                }
            }

            ImputedDataTable.Set(context, result);
            status = "Successfully imputed missing values with the mode.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ImputedDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error imputing by mode: {ex.Message}");
        }
    }

    private static object? ComputeMode(List<DataRow> rows, string col)
    {
        var mode = StatisticsHelper.Mode(rows.Select(r => r[col]));
        if (mode.HasValue)
            return mode.Value;

        // Fall back to string mode for non-numeric columns.
        var groups = rows.Select(r => r[col]?.ToString() ?? "")
            .Where(v => !string.IsNullOrEmpty(v))
            .GroupBy(v => v, StringComparer.OrdinalIgnoreCase)
            .OrderByDescending(g => g.Count())
            .ThenBy(g => g.Key, StringComparer.OrdinalIgnoreCase)
            .FirstOrDefault();
        return groups?.Key;
    }
}
