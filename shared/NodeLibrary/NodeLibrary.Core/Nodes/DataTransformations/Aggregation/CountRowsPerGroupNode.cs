using System.Data;

namespace NodeLibrary.AggregationNodes;

[DisplayName("Count Rows Per Group"), Description("Adds a column with the number of rows in each group, optionally counting distinct values of a column. If no group columns are given, a single count is produced for the whole table.")]
[NodeMetadata(icon: "/assets/Aggregation.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class CountRowsPerGroupNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to count rows for.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Group By Columns"), Description("Optional comma-separated columns to group by. Leave empty to count the whole table.")]
    public InArgument<string> GroupByColumns { get; set; } = new InArgument<string>();

    [DisplayName("Distinct Column"), Description("Optional column to count distinct values of instead of counting all rows. Leave empty to count all rows.")]
    public InArgument<string> DistinctColumn { get; set; } = new InArgument<string>();

    [DisplayName("Result Column Name"), Description("The name of the result column. Defaults to 'RowCount'.")]
    public InArgument<string> ResultColumnName { get; set; } = new InArgument<string>();

    [DisplayName("Result Data Table"), Description("The resulting data table.")]
    public OutArgument<DataTable> ResultDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var groupByColumns = GroupByColumns.Get(context);
            var distinctColumn = DistinctColumn.Get(context);
            var resultColumnName = ResultColumnName.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (!string.IsNullOrWhiteSpace(distinctColumn) && !dataTable.Columns.Contains(distinctColumn))
                throw new ArgumentException($"Distinct column '{distinctColumn}' does not exist in the data table.");

            var result = dataTable.Copy();
            var resultColumn = string.IsNullOrWhiteSpace(resultColumnName) ? "RowCount" : resultColumnName.Trim();
            if (!result.Columns.Contains(resultColumn))
                result.Columns.Add(resultColumn, typeof(long));

            var groupCols = string.IsNullOrWhiteSpace(groupByColumns)
                ? new List<string>()
                : groupByColumns.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

            if (groupCols.Count == 0)
            {
                var count = ComputeCount(result.AsEnumerable(), distinctColumn);
                foreach (var row in result.Rows.OfType<DataRow>())
                    row[resultColumn] = count;
            }
            else
            {
                var groups = result.AsEnumerable().GroupBy(row => string.Join("\u0001", groupCols.Select(c => row[c]?.ToString() ?? "")));
                foreach (var group in groups)
                {
                    var count = ComputeCount(group, distinctColumn);
                    foreach (var row in group)
                        row[resultColumn] = count;
                }
            }

            ResultDataTable.Set(context, result);
            status = "Successfully counted rows per group.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ResultDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error counting rows per group: {ex.Message}");
        }
    }

    private static long ComputeCount(IEnumerable<DataRow> rows, string? distinctColumn)
    {
        if (string.IsNullOrWhiteSpace(distinctColumn))
            return rows.Count();
        return rows.Select(r => r[distinctColumn]?.ToString() ?? "").Distinct().Count();
    }
}
