using System.Data;
using NodeLibrary.DataTableNodes.Helpers;

namespace NodeLibrary.EncodingNodes;

[DisplayName("Min-Max Scale"), Description("Scales the values of one or more numeric columns to a target range (default 0 to 1) using the global min/max of each column.")]
[NodeMetadata(icon: "/assets/Encoding.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class MinMaxScaleNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table containing the numeric columns to scale.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Columns To Scale"), Description("Comma-separated numeric column names to scale.")]
    public required InArgument<string> ColumnsToScale { get; set; }

    [DisplayName("Minimum"), Description("The lower bound of the target range. Defaults to 0.")]
    public InArgument<decimal> Minimum { get; set; } = new InArgument<decimal>(0m);

    [DisplayName("Maximum"), Description("The upper bound of the target range. Defaults to 1.")]
    public InArgument<decimal> Maximum { get; set; } = new InArgument<decimal>(1m);

    [DisplayName("Scaled Data Table"), Description("The resulting data table with scaled columns.")]
    public OutArgument<DataTable> ScaledDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var columnsToScale = ColumnsToScale.Get(context) ?? string.Empty;
            var min = Minimum.Get(context);
            var max = Maximum.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (max <= min)
                throw new ArgumentException("Maximum must be greater than Minimum.");

            var cols = columnsToScale.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
            foreach (var col in cols)
                if (!dataTable.Columns.Contains(col))
                    throw new ArgumentException($"Column '{col}' does not exist in the data table.");

            var result = dataTable.Copy();
            foreach (var col in cols)
            {
                var values = StatisticsHelper.ToDecimals(result.AsEnumerable().Select(r => r[col]));
                if (values.Count == 0)
                    continue;
                var colMin = values.Min();
                var colMax = values.Max();
                var range = colMax - colMin;

                foreach (var row in result.AsEnumerable())
                {
                    var d = StatisticsHelper.ToDecimals(new[] { row[col] });
                    if (d.Count == 0)
                        continue;
                    var scaled = range == 0m ? (min + max) / 2m : min + (d[0] - colMin) / range * (max - min);
                    row[col] = scaled;
                }
            }

            ScaledDataTable.Set(context, result);
            status = "Successfully scaled columns.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ScaledDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error scaling columns: {ex.Message}");
        }
    }
}
