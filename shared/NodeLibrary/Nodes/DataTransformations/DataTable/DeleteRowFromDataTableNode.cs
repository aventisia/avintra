using System.Data;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Delete Row From Data Table"), Description("Deletes a row from a data table based on its zero-based index.")]
[NodeMetadata(icon: "/assets/DataTable.svg")]
public sealed class DeleteRowFromDataTableNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table from which the row will be deleted.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Row Index"), Description("The zero-based index of the row to delete.")]
    public required InArgument<int> RowIndex { get; set; }

    [DisplayName("Modified Data Table"), Description("Returns the updated data table after the row is deleted.")]
    public OutArgument<DataTable> ModifiedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var dataTable = DataTable.Get(context);
            var rowIndex = RowIndex.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");

            if (dataTable.Rows.Count == 0)
                throw new InvalidOperationException("Cannot delete row from an empty data table.");

            if (rowIndex < 0 || rowIndex >= dataTable.Rows.Count)
                throw new ArgumentOutOfRangeException(nameof(rowIndex),
                    $"Row index must be between 0 and {dataTable.Rows.Count - 1}.");

            // Delete the specified row. Clone the table to avoid mutating the original
            var clonedTable = dataTable.Copy();
            clonedTable.Rows.RemoveAt(rowIndex);

            // Set outputs
            ModifiedDataTable.Set(context, clonedTable);
            status = $"Successfully deleted row at index {rowIndex}.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ModifiedDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error deleting row: {ex.Message}");
        }
    }
}
