using System.Data;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Update Data Table Item"), Description("Updates a specific cell in a DataTable by specifying the column, row, and new value.")]
[NodeMetadata(icon: "/assets/DataTable.svg")]
public class UpdateDataTableItemNode : BaseNode
{
    [DisplayName("Data Table"), Description("The DataTable containing the data to be updated.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Column"), Description("The name of the column where the update should occur.")]
    public required InArgument<string> Column { get; set; }

    [DisplayName("Row"), Description("The row index or primary key value of the row to update.")]
    public required InArgument<int> Row { get; set; }

    [DisplayName("New Value"), Description("The new value to set for the specified cell.")]
    public required InArgument<object> NewValue { get; set; }

    [DisplayName("Modified Data Table"), Description("The DataTable after the specified cell has been updated.")]
    public OutArgument<DataTable> ModifiedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            // Retrieve input values
            var dataTable = DataTable.Get(context);
            var columnName = Column.Get(context);
            var rowIndex = Row.Get(context);
            var newValue = NewValue.Get(context);

            // Validate inputs
            if (dataTable == null) throw new ArgumentException("Data table cannot be null.");

            if (string.IsNullOrWhiteSpace(columnName))
                throw new ArgumentException("Column name cannot be null or empty.");

            if (rowIndex < 0 || rowIndex >= dataTable.Rows.Count)
                throw new IndexOutOfRangeException(
                    $"Row index {rowIndex} is out of range. Data table has {dataTable.Rows.Count} rows.");

            if (!dataTable.Columns.Contains(columnName))
                throw new ArgumentException($"Column '{columnName}' not found in data table.");

            // Clone to avoid mutating original
            var modifiedTable = dataTable.Copy();

            // Update the cell
            modifiedTable.Rows[rowIndex][columnName] = newValue ?? DBNull.Value;

            // Set outputs
            ModifiedDataTable.Set(context, modifiedTable);
            status = $"Successfully updated cell at row {rowIndex}, column '{columnName}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ModifiedDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error updating data table item: {ex.Message}");
        }
    }
}
