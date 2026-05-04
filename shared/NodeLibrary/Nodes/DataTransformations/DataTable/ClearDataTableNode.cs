namespace NodeLibrary.DataTableNodes;

[DisplayName("Clear Data Table"), Description("Removes all rows from a data table while preserving its structure.")]
[NodeMetadata(icon: "/assets/DataTable.svg")]
public class ClearDataTableNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table variable to clear. Must have been previously created or assigned.")]
    public required InArgument<DataTable> DataTable { get; set; }

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var dataTable = DataTable.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");

            // Clear all rows in the data table
            dataTable.Clear();
            status = "Successfully cleared all rows from the data table.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error clearing data table: {ex.Message}");
        }
    }
}
