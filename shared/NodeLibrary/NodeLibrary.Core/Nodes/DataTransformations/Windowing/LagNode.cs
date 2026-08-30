using System.Data;
using NodeLibrary.DataTableNodes.Helpers;

namespace NodeLibrary.WindowingNodes;

[DisplayName("Lag"), Description("Adds a column with the value of a source column from a row that is offset rows earlier within each partition. Rows without an earlier row get the default value.")]
[NodeMetadata(icon: "/assets/Windowing.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class LagNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to compute lag values for.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Source Column"), Description("The column whose earlier values are retrieved.")]
    public required InArgument<string> SourceColumn { get; set; }

    [DisplayName("Offset"), Description("The number of rows to look back. Defaults to 1.")]
    public InArgument<int> Offset { get; set; } = new InArgument<int>(1);

    [DisplayName("Default Value"), Description("Optional value used when no earlier row exists within the partition.")]
    public InArgument<string> DefaultValue { get; set; } = new InArgument<string>();

    [DisplayName("Partition By Columns"), Description("Optional comma-separated columns that define partitions. Lag does not cross partition boundaries.")]
    public InArgument<string> PartitionByColumns { get; set; } = new InArgument<string>();

    [DisplayName("Result Column Name"), Description("The name of the lag column. Defaults to '<SourceColumn>_Lag<Offset>'.")]
    public InArgument<string> ResultColumnName { get; set; } = new InArgument<string>();

    [DisplayName("Result Data Table"), Description("The resulting data table.")]
    public OutArgument<DataTable> ResultDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var sourceColumn = SourceColumn.Get(context);
            var offset = Offset.Get(context);
            var defaultValue = DefaultValue.Get(context);
            var partitionByColumns = PartitionByColumns.Get(context);
            var resultColumnName = ResultColumnName.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(sourceColumn) || !dataTable.Columns.Contains(sourceColumn))
                throw new ArgumentException($"Source column '{sourceColumn}' does not exist in the data table.");
            if (offset < 0)
                throw new ArgumentException("Offset must be zero or greater.");

            var result = dataTable.Copy();
            var resultColumn = string.IsNullOrWhiteSpace(resultColumnName) ? $"{sourceColumn}_Lag{offset}" : resultColumnName.Trim();
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
                    var sourceIndex = i - offset;
                    if (sourceIndex >= 0)
                    {
                        rows[i][resultColumn] = rows[sourceIndex][sourceColumn];
                    }
                    else
                    {
                        rows[i][resultColumn] = string.IsNullOrWhiteSpace(defaultValue) ? DBNull.Value : defaultValue;
                    }
                }
            }

            ResultDataTable.Set(context, result);
            status = "Successfully computed lag values.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ResultDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error computing lag values: {ex.Message}");
        }
    }
}
