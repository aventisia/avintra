using System.Data;
using NodeLibrary.DataTableNodes.Helpers;

namespace NodeLibrary.EncodingNodes;

[DisplayName("Bin Values"), Description("Bins numeric values into equal-width buckets. Adds a column containing the bin label (e.g. '1', '2') and optionally the lower bound of each bin.")]
[NodeMetadata(icon: "/assets/Encoding.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class BinValuesNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table containing the numeric column to bin.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Value Column"), Description("The numeric column to bin.")]
    public required InArgument<string> ValueColumn { get; set; }

    [DisplayName("Number Of Bins"), Description("The number of equal-width bins. Defaults to 4.")]
    public InArgument<int> NumberOfBins { get; set; } = new InArgument<int>(4);

    [DisplayName("Result Column Name"), Description("The name of the bin column. Defaults to '<ValueColumn>_Bin'.")]
    public InArgument<string> ResultColumnName { get; set; } = new InArgument<string>();

    [DisplayName("Binned Data Table"), Description("The resulting data table with the bin column.")]
    public OutArgument<DataTable> BinnedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var valueColumn = ValueColumn.Get(context);
            var numberOfBins = NumberOfBins.Get(context);
            var resultColumnName = ResultColumnName.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(valueColumn) || !dataTable.Columns.Contains(valueColumn))
                throw new ArgumentException($"Value column '{valueColumn}' does not exist in the data table.");
            if (numberOfBins <= 0)
                throw new ArgumentException("Number Of Bins must be greater than zero.");

            var result = dataTable.Copy();
            var resultColumn = string.IsNullOrWhiteSpace(resultColumnName) ? $"{valueColumn}_Bin" : resultColumnName.Trim();
            if (!result.Columns.Contains(resultColumn))
                result.Columns.Add(resultColumn, typeof(int));

            var values = StatisticsHelper.ToDecimals(result.AsEnumerable().Select(r => r[valueColumn]));
            if (values.Count == 0)
            {
                BinnedDataTable.Set(context, result);
                status = "No numeric values found to bin.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
                return;
            }

            var min = values.Min();
            var max = values.Max();
            var span = max - min;
            var binWidth = span == 0m ? 1m : span / numberOfBins;

            foreach (var row in result.AsEnumerable())
            {
                var d = StatisticsHelper.ToDecimals(new[] { row[valueColumn] });
                if (d.Count == 0)
                {
                    row[resultColumn] = DBNull.Value;
                    continue;
                }
                var value = d[0];
                var bin = (int)Math.Floor((value - min) / binWidth);
                if (bin >= numberOfBins)
                    bin = numberOfBins - 1;
                if (bin < 0)
                    bin = 0;
                row[resultColumn] = bin + 1; // 1-based bin labels
            }

            BinnedDataTable.Set(context, result);
            status = $"Successfully binned values into {numberOfBins} bins.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            BinnedDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error binning values: {ex.Message}");
        }
    }
}
