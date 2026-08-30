using System.Data;

namespace NodeLibrary.WindowingNodes;

[DisplayName("Row Number"), Description("Adds a column with a sequential row number. If partition columns are given, the numbering restarts at 1 for each partition.")]
[NodeMetadata(icon: "/assets/Windowing.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class RowNumberNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to add row numbers to.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Partition By Columns"), Description("Optional comma-separated columns that define partitions. Row numbering restarts per partition.")]
    public InArgument<string> PartitionByColumns { get; set; } = new InArgument<string>();

    [DisplayName("Result Column Name"), Description("The name of the row number column. Defaults to 'RowNumber'.")]
    public InArgument<string> ResultColumnName { get; set; } = new InArgument<string>();

    [DisplayName("Result Data Table"), Description("The resulting data table.")]
    public OutArgument<DataTable> ResultDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var partitionByColumns = PartitionByColumns.Get(context);
            var resultColumnName = ResultColumnName.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");

            var result = dataTable.Copy();
            var resultColumn = string.IsNullOrWhiteSpace(resultColumnName) ? "RowNumber" : resultColumnName.Trim();
            if (!result.Columns.Contains(resultColumn))
                result.Columns.Add(resultColumn, typeof(long));

            var partitionCols = string.IsNullOrWhiteSpace(partitionByColumns)
                ? new List<string>()
                : partitionByColumns.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

            if (partitionCols.Count == 0)
            {
                long idx = 1;
                foreach (var row in result.Rows.OfType<DataRow>())
                {
                    row[resultColumn] = idx++;
                }
            }
            else
            {
                var partitions = result.AsEnumerable().GroupBy(row => string.Join("\u0001", partitionCols.Select(c => row[c]?.ToString() ?? "")));
                foreach (var partition in partitions)
                {
                    long idx = 1;
                    foreach (var row in partition)
                    {
                        row[resultColumn] = idx++;
                    }
                }
            }

            ResultDataTable.Set(context, result);
            status = "Successfully added row numbers.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ResultDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error adding row numbers: {ex.Message}");
        }
    }
}
