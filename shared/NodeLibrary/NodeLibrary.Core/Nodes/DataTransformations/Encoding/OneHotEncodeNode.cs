using System.Data;

namespace NodeLibrary.EncodingNodes;

[DisplayName("One-Hot Encode"), Description("Creates one new binary (0/1) column for each distinct value in the source column. Optionally drops the original column. Produces one row per distinct value unless a single row is selected for the whole table.")]
[NodeMetadata(icon: "/assets/Encoding.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class OneHotEncodeNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table containing the categorical column to encode.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Column To Encode"), Description("The categorical column to one-hot encode.")]
    public required InArgument<string> ColumnToEncode { get; set; }

    [DisplayName("Column Prefix"), Description("Optional prefix for the generated columns. Defaults to the source column name.")]
    public InArgument<string> ColumnPrefix { get; set; } = new InArgument<string>();

    [DisplayName("Drop Source Column"), Description("True to remove the original column from the result. Defaults to false.")]
    public InArgument<bool> DropSourceColumn { get; set; } = new InArgument<bool>(false);

    [DisplayName("Encoded Data Table"), Description("The resulting data table with the one-hot encoded columns.")]
    public OutArgument<DataTable> EncodedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var columnToEncode = ColumnToEncode.Get(context);
            var columnPrefix = ColumnPrefix.Get(context);
            var dropSourceColumn = DropSourceColumn.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(columnToEncode) || !dataTable.Columns.Contains(columnToEncode))
                throw new ArgumentException($"Column '{columnToEncode}' does not exist in the data table.");

            var prefix = string.IsNullOrWhiteSpace(columnPrefix) ? columnToEncode : columnPrefix.Trim();

            // Capture original values per row index first (before dropping the column).
            var originalValues = dataTable.AsEnumerable()
                .Select(r => r[columnToEncode]?.ToString() ?? "")
                .ToList();

            var distinctValues = originalValues
                .Where(v => !string.IsNullOrEmpty(v))
                .Distinct()
                .OrderBy(v => v)
                .ToList();

            var result = dataTable.Copy();
            if (dropSourceColumn)
                result.Columns.Remove(columnToEncode);

            var columns = new List<string>();
            foreach (var value in distinctValues)
            {
                var colName = $"{prefix}_{value}";
                var safe = MakeUnique(result, colName);
                result.Columns.Add(safe, typeof(int));
                columns.Add(safe);
            }

            var rows = result.AsEnumerable().ToList();
            for (var rowIdx = 0; rowIdx < rows.Count; rowIdx++)
            {
                var val = originalValues[rowIdx];
                for (var c = 0; c < columns.Count; c++)
                    rows[rowIdx][columns[c]] = (val == distinctValues[c]) ? 1 : 0;
            }

            EncodedDataTable.Set(context, result);
            status = $"Successfully one-hot encoded into {columns.Count} columns.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            EncodedDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error one-hot encoding: {ex.Message}");
        }
    }

    private static string MakeUnique(DataTable table, string name)
    {
        if (!table.Columns.Contains(name))
            return name;
        var i = 2;
        while (table.Columns.Contains($"{name}_{i}"))
            i++;
        return $"{name}_{i}";
    }
}
