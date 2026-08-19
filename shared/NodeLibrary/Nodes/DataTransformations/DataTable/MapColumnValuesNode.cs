using System.Data;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Map Column Values"), Description("Replaces values in a column using a lookup dictionary of 'from:to' pairs.")]
[NodeMetadata(icon: "/assets/DataTable.svg", badge: "Beta")]
public class MapColumnValuesNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table containing the column to map.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Column"), Description("The name of the column whose values will be mapped.")]
    public required InArgument<string> Column { get; set; }

    [DisplayName("Mapping"), Description("Comma-separated 'from:to' pairs, e.g., '1:Active,0:Inactive'. Values not found in the mapping are left unchanged.")]
    public required InArgument<string> Mapping { get; set; }

    [DisplayName("Updated Data Table"), Description("The data table with the mapped column values.")]
    public OutArgument<DataTable> UpdatedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var column = Column.Get(context);
            var mapping = Mapping.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(column))
                throw new ArgumentException("Column cannot be empty.");
            if (string.IsNullOrWhiteSpace(mapping))
                throw new ArgumentException("Mapping cannot be empty.");
            if (!dataTable.Columns.Contains(column))
                throw new ArgumentException($"Column '{column}' does not exist in the data table.");

            var lookup = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            var pairs = mapping.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            foreach (var pair in pairs)
            {
                var parts = pair.Split(':', 2);
                if (parts.Length != 2)
                    throw new ArgumentException($"Invalid mapping pair '{pair}'. Expected 'from:to'.");
                lookup[parts[0].Trim()] = parts[1].Trim();
            }

            var resultTable = dataTable.Copy();
            foreach (DataRow row in resultTable.Rows)
            {
                if (row[column] == null || row[column] == DBNull.Value)
                    continue;
                var key = row[column].ToString() ?? "";
                if (lookup.TryGetValue(key, out var replacement))
                    row[column] = replacement;
            }

            UpdatedDataTable.Set(context, resultTable);
            status = $"Successfully mapped values in column '{column}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            UpdatedDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error mapping column values: {ex.Message}");
        }
    }
}
