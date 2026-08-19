using System.Data;

namespace NodeLibrary.ShapingNodes;

[DisplayName("Collapse Rows to Delimited"), Description("Groups rows and concatenates the values of a target column into a single delimited string per group, producing one row per group.")]
[NodeMetadata(icon: "/assets/Shaping.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class CollapseRowsToDelimitedNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to collapse.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Group By Columns"), Description("Comma-separated columns that define the groups to collapse.")]
    public required InArgument<string> GroupByColumns { get; set; }

    [DisplayName("Target Column"), Description("The column whose values are concatenated within each group.")]
    public required InArgument<string> TargetColumn { get; set; }

    [DisplayName("Delimiter"), Description("The delimiter between concatenated values. Defaults to a comma.")]
    public InArgument<string> Delimiter { get; set; } = new InArgument<string>(",");

    [DisplayName("Distinct Values Only"), Description("True to only include distinct values per group. Defaults to false.")]
    public InArgument<bool> DistinctValuesOnly { get; set; } = new InArgument<bool>(false);

    [DisplayName("Result Column Name"), Description("The name of the concatenated column. Defaults to '<TargetColumn>_Collapsed'.")]
    public InArgument<string> ResultColumnName { get; set; } = new InArgument<string>();

    [DisplayName("Collapsed Data Table"), Description("The resulting collapsed data table.")]
    public OutArgument<DataTable> CollapsedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var groupByColumns = GroupByColumns.Get(context);
            var targetColumn = TargetColumn.Get(context);
            var delimiter = Delimiter.Get(context);
            var distinctValuesOnly = DistinctValuesOnly.Get(context);
            var resultColumnName = ResultColumnName.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(targetColumn) || !dataTable.Columns.Contains(targetColumn))
                throw new ArgumentException($"Target column '{targetColumn}' does not exist in the data table.");

            var groupCols = groupByColumns.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
            foreach (var col in groupCols)
                if (!dataTable.Columns.Contains(col))
                    throw new ArgumentException($"Group By column '{col}' does not exist in the data table.");

            var resultColumn = string.IsNullOrWhiteSpace(resultColumnName) ? $"{targetColumn}_Collapsed" : resultColumnName.Trim();
            var result = new DataTable();
            foreach (var col in groupCols)
                result.Columns.Add(col, dataTable.Columns[col].DataType);
            result.Columns.Add(resultColumn, typeof(string));

            var groups = dataTable.AsEnumerable().GroupBy(row => string.Join("\u0001", groupCols.Select(c => row[c]?.ToString() ?? "")));
            foreach (var group in groups)
            {
                var values = group.Select(r => r[targetColumn])
                    .Where(v => v != null && v is not DBNull)
                    .Select(v => Convert.ToString(v, CultureInfo.InvariantCulture) ?? "");
                if (distinctValuesOnly)
                    values = values.Distinct();
                var combined = string.Join(delimiter, values);

                var newRow = result.NewRow();
                var keys = group.Key.Split('\u0001');
                for (var i = 0; i < groupCols.Count; i++)
                    newRow[groupCols[i]] = keys[i];
                newRow[resultColumn] = combined;
                result.Rows.Add(newRow);
            }

            CollapsedDataTable.Set(context, result);
            status = $"Successfully collapsed rows into {result.Rows.Count} groups.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            CollapsedDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error collapsing rows: {ex.Message}");
        }
    }
}
