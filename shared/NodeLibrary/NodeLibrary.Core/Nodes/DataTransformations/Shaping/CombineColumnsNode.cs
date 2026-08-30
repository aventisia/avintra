using System.Data;

namespace NodeLibrary.ShapingNodes;

[DisplayName("Combine Columns"), Description("Merges the values of multiple columns into a single column, separated by a delimiter. The original columns can be removed or kept.")]
[NodeMetadata(icon: "/assets/Shaping.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class CombineColumnsNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to combine columns from.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Columns To Combine"), Description("Comma-separated column names to merge into one column, in order.")]
    public required InArgument<string> ColumnsToCombine { get; set; }

    [DisplayName("Delimiter"), Description("The separator placed between combined values. Defaults to a single space.")]
    public InArgument<string> Delimiter { get; set; } = new InArgument<string>(" ");

    [DisplayName("Result Column Name"), Description("The name of the combined column. Defaults to 'Combined'.")]
    public InArgument<string> ResultColumnName { get; set; } = new InArgument<string>("Combined");

    [DisplayName("Remove Source Columns"), Description("True to remove the source columns after combining. Defaults to false.")]
    public InArgument<bool> RemoveSourceColumns { get; set; } = new InArgument<bool>(false);

    [DisplayName("Skip Empty Values"), Description("True to skip null/empty source values when combining. Defaults to false.")]
    public InArgument<bool> SkipEmptyValues { get; set; } = new InArgument<bool>(false);

    [DisplayName("Result Data Table"), Description("The resulting data table.")]
    public OutArgument<DataTable> ResultDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var columnsToCombine = ColumnsToCombine.Get(context) ?? string.Empty;
            var delimiter = Delimiter.Get(context) ?? string.Empty;
            var resultColumnName = ResultColumnName.Get(context) ?? string.Empty;
            var removeSourceColumns = RemoveSourceColumns.Get(context);
            var skipEmptyValues = SkipEmptyValues.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");

            if (string.IsNullOrWhiteSpace(columnsToCombine))
                throw new ArgumentException("Columns To Combine cannot be empty.");

            var combineCols = columnsToCombine.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
            foreach (var col in combineCols)
                if (!dataTable.Columns.Contains(col))
                    throw new ArgumentException($"Column '{col}' does not exist in the data table.");

            var result = dataTable.Copy();
            result.Columns.Add(resultColumnName, typeof(string));

            foreach (var row in result.AsEnumerable())
            {
                var parts = new List<string>();
                foreach (var col in combineCols)
                {
                    var v = row[col];
                    var s = v is DBNull || v == null ? null : Convert.ToString(v, CultureInfo.InvariantCulture);
                    if (skipEmptyValues && string.IsNullOrEmpty(s))
                        continue;
                    parts.Add(s ?? "");
                }
                row[resultColumnName] = string.Join(delimiter, parts);
            }

            if (removeSourceColumns)
                foreach (var col in combineCols)
                    result.Columns.Remove(col);

            ResultDataTable.Set(context, result);
            status = "Successfully combined columns.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ResultDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error combining columns: {ex.Message}");
        }
    }
}
