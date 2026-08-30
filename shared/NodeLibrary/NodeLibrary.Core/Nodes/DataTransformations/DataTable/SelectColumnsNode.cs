using System.Data;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Select Columns"), Description("Keeps only the specified columns of a data table, preserving their order.")]
[NodeMetadata(icon: "/assets/DataTable.svg", badge: "Beta")]
public class SelectColumnsNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table whose columns will be selected.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Columns"), Description("Comma-separated column names to keep, in the desired order.")]
    public required InArgument<string> Columns { get; set; }

    [DisplayName("Selected Data Table"), Description("The data table containing only the selected columns.")]
    public OutArgument<DataTable> SelectedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var columns = Columns.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(columns))
                throw new ArgumentException("Columns cannot be empty.");

            var columnNames = columns
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToList();

            foreach (var col in columnNames)
            {
                if (!dataTable.Columns.Contains(col))
                    throw new ArgumentException($"Column '{col}' does not exist in the data table.");
            }

            var resultTable = dataTable.Clone();
            // Remove all columns then re-add only selected ones
            resultTable.Columns.Clear();
            foreach (var col in columnNames)
                resultTable.Columns.Add(col, dataTable.Columns[col].DataType);

            foreach (DataRow row in dataTable.Rows)
            {
                var newRow = resultTable.NewRow();
                foreach (var col in columnNames)
                    newRow[col] = row[col];
                resultTable.Rows.Add(newRow);
            }

            SelectedDataTable.Set(context, resultTable);
            status = $"Successfully selected {columnNames.Count} columns.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            SelectedDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error selecting columns: {ex.Message}");
        }
    }
}
