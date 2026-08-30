using System.Data;
using NodeLibrary.DataTableNodes.Helpers;

namespace NodeLibrary.EncodingNodes;

[DisplayName("Z-Score Standardize"), Description("Standardizes one or more numeric columns to have zero mean and unit variance (sample standard deviation) using each column's global statistics.")]
[NodeMetadata(icon: "/assets/Encoding.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class ZScoreStandardizeNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table containing the numeric columns to standardize.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Columns To Standardize"), Description("Comma-separated numeric column names to standardize.")]
    public required InArgument<string> ColumnsToStandardize { get; set; }

    [DisplayName("Standardized Data Table"), Description("The resulting data table with standardized columns.")]
    public OutArgument<DataTable> StandardizedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var columnsToStandardize = ColumnsToStandardize.Get(context) ?? string.Empty;

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");

            var cols = columnsToStandardize.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
            foreach (var col in cols)
                if (!dataTable.Columns.Contains(col))
                    throw new ArgumentException($"Column '{col}' does not exist in the data table.");

            var result = dataTable.Copy();
            foreach (var col in cols)
            {
                var values = StatisticsHelper.ToDecimals(result.AsEnumerable().Select(r => r[col]));
                if (values.Count < 2)
                    continue;
                var mean = values.Average();
                var sd = StatisticsHelper.StandardDeviation(values, sample: true);
                if (!sd.HasValue || sd.Value == 0m)
                    continue;

                foreach (var row in result.AsEnumerable())
                {
                    var d = StatisticsHelper.ToDecimals(new[] { row[col] });
                    if (d.Count == 0)
                        continue;
                    row[col] = (d[0] - mean) / sd.Value;
                }
            }

            StandardizedDataTable.Set(context, result);
            status = "Successfully standardized columns.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            StandardizedDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error standardizing columns: {ex.Message}");
        }
    }
}
