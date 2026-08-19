using System.Data;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Rename Columns"), Description("Renames one or more columns of a data table using a list of 'oldName:newName' pairs.")]
[NodeMetadata(icon: "/assets/DataTable.svg", badge: "Beta")]
public class RenameColumnsNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table whose columns will be renamed.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Renames"), Description("Comma-separated 'oldName:newName' pairs, e.g., 'ID:OrderId,Total:Amount'.")]
    public required InArgument<string> Renames { get; set; }

    [DisplayName("Renamed Data Table"), Description("The data table with the renamed columns.")]
    public OutArgument<DataTable> RenamedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var renames = Renames.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(renames))
                throw new ArgumentException("Renames cannot be empty.");

            var resultTable = dataTable.Copy();
            var pairs = renames
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

            var renamedCount = 0;
            foreach (var pair in pairs)
            {
                var parts = pair.Split(':', 2);
                if (parts.Length != 2)
                    throw new ArgumentException($"Invalid rename pair '{pair}'. Expected 'oldName:newName'.");
                var oldName = parts[0].Trim();
                var newName = parts[1].Trim();
                if (string.IsNullOrWhiteSpace(oldName) || string.IsNullOrWhiteSpace(newName))
                    throw new ArgumentException($"Invalid rename pair '{pair}'. Names cannot be empty.");
                if (!resultTable.Columns.Contains(oldName))
                    throw new ArgumentException($"Column '{oldName}' does not exist in the data table.");
                resultTable.Columns[oldName].ColumnName = newName;
                renamedCount++;
            }

            RenamedDataTable.Set(context, resultTable);
            status = $"Successfully renamed {renamedCount} columns.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            RenamedDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error renaming columns: {ex.Message}");
        }
    }
}
