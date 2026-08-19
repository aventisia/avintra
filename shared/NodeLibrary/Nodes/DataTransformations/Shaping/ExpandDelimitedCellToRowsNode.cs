using System.Data;

namespace NodeLibrary.ShapingNodes;

[DisplayName("Expand Delimited Cell to Rows"), Description("Explodes cells of a target column by a delimiter, producing one row per delimited value. Other columns are replicated across the expanded rows.")]
[NodeMetadata(icon: "/assets/Shaping.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class ExpandDelimitedCellToRowsNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to expand.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Target Column"), Description("The column whose delimited values are expanded into separate rows.")]
    public required InArgument<string> TargetColumn { get; set; }

    [DisplayName("Delimiter"), Description("The delimiter separating values in the target column. Defaults to a comma.")]
    public InArgument<string> Delimiter { get; set; } = new InArgument<string>(",");

    [DisplayName("Trim Values"), Description("True to trim whitespace around expanded values. Defaults to true.")]
    public InArgument<bool> TrimValues { get; set; } = new InArgument<bool>(true);

    [DisplayName("Skip Empty Values"), Description("True to drop empty expanded values. Defaults to true.")]
    public InArgument<bool> SkipEmptyValues { get; set; } = new InArgument<bool>(true);

    [DisplayName("Expanded Data Table"), Description("The resulting expanded data table.")]
    public OutArgument<DataTable> ExpandedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var targetColumn = TargetColumn.Get(context);
            var delimiter = Delimiter.Get(context);
            var trimValues = TrimValues.Get(context);
            var skipEmptyValues = SkipEmptyValues.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(targetColumn) || !dataTable.Columns.Contains(targetColumn))
                throw new ArgumentException($"Target column '{targetColumn}' does not exist in the data table.");

            var result = dataTable.Clone();

            foreach (var row in dataTable.AsEnumerable())
            {
                var raw = row[targetColumn];
                var value = raw is DBNull || raw == null ? null : Convert.ToString(raw, CultureInfo.InvariantCulture);
                if (string.IsNullOrEmpty(value))
                {
                    result.ImportRow(row);
                    continue;
                }

                var parts = value.Split(new[] { delimiter }, StringSplitOptions.None);
                foreach (var part in parts)
                {
                    var trimmed = trimValues ? part.Trim() : part;
                    if (skipEmptyValues && string.IsNullOrEmpty(trimmed))
                        continue;
                    var newRow = result.NewRow();
                    newRow.ItemArray = (object[])row.ItemArray.Clone();
                    newRow[targetColumn] = trimmed;
                    result.Rows.Add(newRow);
                }
            }

            ExpandedDataTable.Set(context, result);
            status = $"Successfully expanded cells into {result.Rows.Count} rows.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ExpandedDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error expanding cells: {ex.Message}");
        }
    }
}
