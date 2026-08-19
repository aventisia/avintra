using System.Data;
using NodeLibrary.DataTableNodes.Enums;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Fill Missing Values"), Description("Fills missing (null) values in a column using a constant, the previous or next value, or the group mean.")]
[NodeMetadata(icon: "/assets/DataTable.svg", badge: "Beta")]
public class FillMissingValuesNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table whose missing values will be filled.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Column"), Description("The name of the column to fill.")]
    public required InArgument<string> Column { get; set; }

    [DisplayName("Fill Method"), Description("How missing values are filled.")]
    public required InArgument<FillMethodEnum> FillMethod { get; set; } = new InArgument<FillMethodEnum>(FillMethodEnum.Constant);

    [DisplayName("Constant Value"), Description("The constant value used by the Constant fill method.")]
    public InArgument<string> ConstantValue { get; set; } = new InArgument<string>();

    [DisplayName("Group By Columns"), Description("Comma-separated column names used to group rows when computing the group mean. Optional.")]
    public InArgument<string> GroupByColumns { get; set; } = new InArgument<string>();

    [DisplayName("Updated Data Table"), Description("The data table with missing values filled.")]
    public OutArgument<DataTable> UpdatedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var column = Column.Get(context);
            var fillMethod = FillMethod.Get(context);
            var constantValue = ConstantValue.Get(context);
            var groupByColumns = GroupByColumns.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(column))
                throw new ArgumentException("Column cannot be empty.");
            if (!dataTable.Columns.Contains(column))
                throw new ArgumentException($"Column '{column}' does not exist in the data table.");

            var resultTable = dataTable.Copy();
            var rows = resultTable.Rows.Cast<DataRow>().ToList();

            // Precompute group means if requested
            var groupMeanCache = new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase);
            var groupCols = (groupByColumns ?? "")
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToList();
            if (fillMethod == FillMethodEnum.GroupMean)
            {
                foreach (var g in groupCols)
                {
                    if (!resultTable.Columns.Contains(g))
                        throw new ArgumentException($"Group By column '{g}' does not exist in the data table.");
                }
                foreach (var group in rows.GroupBy(r => string.Join("\u0001", groupCols.Select(c => r[c]?.ToString() ?? ""))))
                {
                    var vals = group
                        .Select(r => r[column])
                        .Where(v => v != null && v != DBNull.Value)
                        .Select(v => decimal.TryParse(v.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var d) ? d : (decimal?)null)
                        .Where(v => v.HasValue)
                        .Select(v => v!.Value)
                        .ToList();
                    if (vals.Count > 0)
                        groupMeanCache[group.Key] = vals.Average();
                }
            }

            for (var i = 0; i < rows.Count; i++)
            {
                if (rows[i][column] != null && rows[i][column] != DBNull.Value)
                    continue;

                object? filled = fillMethod switch
                {
                    FillMethodEnum.Constant => constantValue,
                    FillMethodEnum.PreviousValue => FindPrevious(rows, i, column),
                    FillMethodEnum.NextValue => FindNext(rows, i, column),
                    FillMethodEnum.GroupMean => GetGroupMean(rows[i], groupCols, groupMeanCache),
                    _ => constantValue
                };
                rows[i][column] = filled ?? DBNull.Value;
            }

            UpdatedDataTable.Set(context, resultTable);
            status = $"Successfully filled missing values in column '{column}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            UpdatedDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error filling missing values: {ex.Message}");
        }
    }

    private static object? FindPrevious(List<DataRow> rows, int index, string column)
    {
        for (var i = index - 1; i >= 0; i--)
        {
            if (rows[i][column] != null && rows[i][column] != DBNull.Value)
                return rows[i][column];
        }
        return null;
    }

    private static object? FindNext(List<DataRow> rows, int index, string column)
    {
        for (var i = index + 1; i < rows.Count; i++)
        {
            if (rows[i][column] != null && rows[i][column] != DBNull.Value)
                return rows[i][column];
        }
        return null;
    }

    private static object? GetGroupMean(DataRow row, List<string> groupCols, Dictionary<string, decimal> cache)
    {
        var key = string.Join("\u0001", groupCols.Select(c => row[c]?.ToString() ?? ""));
        return cache.TryGetValue(key, out var mean) ? mean : DBNull.Value;
    }
}
