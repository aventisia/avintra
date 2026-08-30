using System.Data;
using NodeLibrary.DataTableNodes.Helpers;

namespace NodeLibrary.EncodingNodes;

[DisplayName("Quantile Bin"), Description("Bins numeric values into equal-frequency quantile buckets based on the sorted values. Each bin contains roughly the same number of values.")]
[NodeMetadata(icon: "/assets/Encoding.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class QuantileBinNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table containing the numeric column to bin.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Value Column"), Description("The numeric column to bin.")]
    public required InArgument<string> ValueColumn { get; set; }

    [DisplayName("Number Of Bins"), Description("The number of quantile bins. Defaults to 4 (quartiles).")]
    public InArgument<int> NumberOfBins { get; set; } = new InArgument<int>(4);

    [DisplayName("Result Column Name"), Description("The name of the bin column. Defaults to '<ValueColumn>_Quantile'.")]
    public InArgument<string> ResultColumnName { get; set; } = new InArgument<string>();

    [DisplayName("Binned Data Table"), Description("The resulting data table with the quantile bin column.")]
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
            var resultColumn = string.IsNullOrWhiteSpace(resultColumnName) ? $"{valueColumn}_Quantile" : resultColumnName.Trim();
            if (!result.Columns.Contains(resultColumn))
                result.Columns.Add(resultColumn, typeof(int));

            // Assign quantile ranks based on the position of each value within its numeric order.
            var ranked = result.AsEnumerable()
                .Select((row, idx) => new { Row = row, Numeric = StatisticsHelper.ToDecimals(new[] { row[valueColumn] }), Index = idx })
                .Where(x => x.Numeric.Count > 0)
                .Select(x => new { x.Row, Value = x.Numeric[0], x.Index })
                .OrderBy(x => x.Value)
                .ToList();

            var count = ranked.Count;
            if (count == 0)
            {
                BinnedDataTable.Set(context, result);
                status = "No numeric values found to bin.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
                return;
            }

            var perBin = (int)Math.Ceiling((double)count / numberOfBins);
            for (var i = 0; i < ranked.Count; i++)
            {
                var bin = i / perBin;
                if (bin >= numberOfBins)
                    bin = numberOfBins - 1;
                ranked[i].Row[resultColumn] = bin + 1; // 1-based bin labels
            }

            BinnedDataTable.Set(context, result);
            status = $"Successfully binned values into {numberOfBins} quantiles.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            BinnedDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error binning values into quantiles: {ex.Message}");
        }
    }
}
