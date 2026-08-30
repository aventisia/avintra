using System.Data;
using NodeLibrary.DataTableNodes.Helpers;

namespace NodeLibrary.WindowingNodes;

[DisplayName("Moving Sum"), Description("Adds a column with the moving (sliding-window) sum of a numeric column. The window restarts for each partition.")]
[NodeMetadata(icon: "/assets/Windowing.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class MovingSumNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to compute the moving sum for.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Value Column"), Description("The numeric column to sum.")]
    public required InArgument<string> ValueColumn { get; set; }

    [DisplayName("Window Size"), Description("The number of rows in the sliding window. Defaults to 3.")]
    public InArgument<int> WindowSize { get; set; } = new InArgument<int>(3);

    [DisplayName("Partition By Columns"), Description("Optional comma-separated columns that define partitions. The moving sum restarts per partition.")]
    public InArgument<string> PartitionByColumns { get; set; } = new InArgument<string>();

    [DisplayName("Result Column Name"), Description("The name of the moving sum column. Defaults to '<ValueColumn>_MovingSum'.")]
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
            var windowSize = WindowSize.Get(context);
            var partitionByColumns = PartitionByColumns.Get(context);
            var resultColumnName = ResultColumnName.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(valueColumn) || !dataTable.Columns.Contains(valueColumn))
                throw new ArgumentException($"Value column '{valueColumn}' does not exist in the data table.");
            if (windowSize <= 0)
                throw new ArgumentException("Window Size must be greater than zero.");

            var result = dataTable.Copy();
            var resultColumn = string.IsNullOrWhiteSpace(resultColumnName) ? $"{valueColumn}_MovingSum" : resultColumnName.Trim();
            if (!result.Columns.Contains(resultColumn))
                result.Columns.Add(resultColumn, typeof(object));

            var partitionCols = PartitionHelper.ParseColumns(partitionByColumns);
            PartitionHelper.ValidateColumns(result, partitionCols);

            var partitions = result.AsEnumerable().GroupBy(row => PartitionHelper.BuildKey(row, partitionCols));
            foreach (var partition in partitions)
            {
                var rows = partition.ToList();
                for (var i = 0; i < rows.Count; i++)
                {
                    var start = Math.Max(0, i - windowSize + 1);
                    var windowValues = StatisticsHelper.ToDecimals(rows.Skip(start).Take(i - start + 1).Select(r => r[valueColumn]));
                    rows[i][resultColumn] = windowValues.Count == 0 ? DBNull.Value : windowValues.Sum();
                }
            }

            ResultDataTable.Set(context, result);
            status = "Successfully computed the moving sum.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ResultDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error computing moving sum: {ex.Message}");
        }
    }
}
