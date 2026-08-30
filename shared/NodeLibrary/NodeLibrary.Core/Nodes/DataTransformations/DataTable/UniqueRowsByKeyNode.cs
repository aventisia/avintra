using System.Data;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Unique Rows by Key"), Description("Removes rows that share the same value in one or more key columns, keeping either the first or last occurrence.")]
[NodeMetadata(icon: "/assets/DataTable.svg", badge: "Beta")]
public class UniqueRowsByKeyNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table from which duplicate-key rows are removed.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Key Columns"), Description("Comma-separated column names that define uniqueness.")]
    public required InArgument<string> KeyColumns { get; set; }

    [DisplayName("Keep First"), Description("If true, keeps the first occurrence; otherwise keeps the last occurrence.")]
    public InArgument<bool> KeepFirst { get; set; } = new InArgument<bool>(true);

    [DisplayName("Unique Data Table"), Description("The data table with duplicate-key rows removed.")]
    public OutArgument<DataTable> UniqueDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var keyColumns = KeyColumns.Get(context);
            var keepFirst = KeepFirst.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(keyColumns))
                throw new ArgumentException("Key Columns cannot be empty.");

            var keys = keyColumns
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToList();
            foreach (var k in keys)
            {
                if (!dataTable.Columns.Contains(k))
                    throw new ArgumentException($"Key column '{k}' does not exist in the data table.");
            }

            var resultTable = dataTable.Clone();
            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var rows = dataTable.Rows.Cast<DataRow>().ToList();
            var selectedRows = keepFirst ? rows : rows.AsEnumerable().Reverse();

            foreach (var row in selectedRows)
            {
                var key = string.Join("\u0001", keys.Select(k => row[k]?.ToString() ?? ""));
                if (seen.Add(key))
                    resultTable.ImportRow(row);
            }

            UniqueDataTable.Set(context, resultTable);
            status = $"Successfully removed duplicate-key rows; {resultTable.Rows.Count} unique rows remain.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            UniqueDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error removing duplicate-key rows: {ex.Message}");
        }
    }
}
