using System.Data;

namespace NodeLibrary.DataQualityNodes;

[DisplayName("Remove Columns by Missing Ratio"), Description("Removes columns whose proportion of missing (null/empty) values exceeds a configurable threshold. The threshold is expressed as a decimal between 0 and 1.")]
[NodeMetadata(icon: "/assets/DataQuality.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class RemoveColumnsByMissingRatioNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to clean.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Max Missing Ratio"), Description("Columns with a missing-value ratio greater than this threshold are removed. Defaults to 0.8 (removes columns >80% missing).")]
    public InArgument<decimal> MaxMissingRatio { get; set; } = new InArgument<decimal>(0.8m);

    [DisplayName("Cleaned Data Table"), Description("The resulting data table with high-missing columns removed.")]
    public OutArgument<DataTable> CleanedDataTable { get; set; } = new OutArgument<DataTable>();

    [DisplayName("Removed Columns"), Description("A comma-separated list of the names of columns that were removed.")]
    public OutArgument<string> RemovedColumns { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var maxMissingRatio = MaxMissingRatio.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (maxMissingRatio < 0m || maxMissingRatio > 1m)
                throw new ArgumentException("Max Missing Ratio must be between 0 and 1.");

            var result = dataTable.Copy();
            var totalRows = result.Rows.Count;
            var removed = new List<string>();

            foreach (var col in result.Columns.Cast<DataColumn>().ToList())
            {
                if (totalRows == 0)
                {
                    removed.Add(col.ColumnName);
                    result.Columns.Remove(col);
                    continue;
                }

                var missing = result.AsEnumerable().Count(r =>
                    r[col] == DBNull.Value || r[col] == null ||
                    (r[col] is string s && string.IsNullOrWhiteSpace(s)));

                var ratio = (decimal)missing / totalRows;
                if (ratio > maxMissingRatio)
                {
                    removed.Add(col.ColumnName);
                    result.Columns.Remove(col);
                }
            }

            CleanedDataTable.Set(context, result);
            RemovedColumns.Set(context, string.Join(", ", removed));
            status = removed.Count == 0
                ? "No columns exceeded the missing-ratio threshold."
                : $"Removed {removed.Count} columns exceeding the missing-ratio threshold.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            CleanedDataTable.Set(context, null);
            RemovedColumns.Set(context, "");
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error removing columns by missing ratio: {ex.Message}");
        }
    }
}
