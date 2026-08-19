using System.Data;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Calculate Column"), Description("Adds a computed column to a data table by evaluating a formula expression that references other columns.")]
[NodeMetadata(icon: "/assets/DataTable.svg", badge: "Beta")]
public class CalculateColumnNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to which the computed column will be added.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Column Name"), Description("The name of the new computed column.")]
    public required InArgument<string> ColumnName { get; set; }

    [DisplayName("Expression"), Description("The expression to evaluate per row. Column names are referenced directly, e.g., 'Price * Quantity' or 'UPPER(Name)'.")]
    public required InArgument<string> Expression { get; set; }

    [DisplayName("Updated Data Table"), Description("The data table with the computed column appended.")]
    public OutArgument<DataTable> UpdatedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var columnName = ColumnName.Get(context);
            var expression = Expression.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(columnName))
                throw new ArgumentException("Column Name cannot be empty.");
            if (string.IsNullOrWhiteSpace(expression))
                throw new ArgumentException("Expression cannot be empty.");
            if (dataTable.Columns.Contains(columnName))
                throw new ArgumentException($"A column named '{columnName}' already exists in the data table.");

            var resultTable = dataTable.Copy();
            var newColumn = new DataColumn(columnName, typeof(object))
            {
                Expression = expression
            };
            resultTable.Columns.Add(newColumn);

            UpdatedDataTable.Set(context, resultTable);
            status = $"Successfully added computed column '{columnName}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            UpdatedDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error calculating column: {ex.Message}");
        }
    }
}
