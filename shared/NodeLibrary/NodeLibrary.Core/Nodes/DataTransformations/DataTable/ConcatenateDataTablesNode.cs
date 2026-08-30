using System.Data;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Concatenate Data Tables"), Description("Stacks two data tables vertically, aligning columns by name. Missing columns are filled with null.")]
[NodeMetadata(icon: "/assets/DataTable.svg", badge: "Beta")]
public class ConcatenateDataTablesNode : BaseNode
{
    [DisplayName("First Data Table"), Description("The first data table to concatenate.")]
    public required InArgument<DataTable> FirstDataTable { get; set; }

    [DisplayName("Second Data Table"), Description("The second data table to append below the first.")]
    public required InArgument<DataTable> SecondDataTable { get; set; }

    [DisplayName("Concatenated Data Table"), Description("The resulting data table with rows from both inputs.")]
    public OutArgument<DataTable> ConcatenatedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var firstDataTable = FirstDataTable.Get(context);
            var secondDataTable = SecondDataTable.Get(context);

            if (firstDataTable == null)
                throw new ArgumentException("First data table cannot be null.");
            if (secondDataTable == null)
                throw new ArgumentException("Second data table cannot be null.");

            var resultTable = new DataTable();
            foreach (DataColumn column in firstDataTable.Columns)
                resultTable.Columns.Add(column.ColumnName, column.DataType);
            foreach (DataColumn column in secondDataTable.Columns)
            {
                if (!resultTable.Columns.Contains(column.ColumnName))
                    resultTable.Columns.Add(column.ColumnName, column.DataType);
            }

            foreach (DataRow row in firstDataTable.Rows)
            {
                var newRow = resultTable.NewRow();
                foreach (DataColumn column in resultTable.Columns)
                    newRow[column.ColumnName] = firstDataTable.Columns.Contains(column.ColumnName) ? row[column.ColumnName] : DBNull.Value;
                resultTable.Rows.Add(newRow);
            }
            foreach (DataRow row in secondDataTable.Rows)
            {
                var newRow = resultTable.NewRow();
                foreach (DataColumn column in resultTable.Columns)
                    newRow[column.ColumnName] = secondDataTable.Columns.Contains(column.ColumnName) ? row[column.ColumnName] : DBNull.Value;
                resultTable.Rows.Add(newRow);
            }

            ConcatenatedDataTable.Set(context, resultTable);
            status = $"Successfully concatenated data tables into {resultTable.Rows.Count} rows.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ConcatenatedDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error concatenating data tables: {ex.Message}");
        }
    }
}
