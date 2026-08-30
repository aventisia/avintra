using System.Data;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Add Record ID"), Description("Adds a sequential record ID column to a data table, starting at a configurable value with a configurable increment.")]
[NodeMetadata(icon: "/assets/DataTable.svg", badge: "Beta")]
public class AddRecordIdNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to which the record ID column will be added.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Column Name"), Description("The name of the new record ID column. Defaults to 'RecordID'.")]
    public InArgument<string> ColumnName { get; set; } = new InArgument<string>("RecordID");

    [DisplayName("Start At"), Description("The value of the first record ID. Defaults to 1.")]
    public InArgument<long> StartAt { get; set; } = new InArgument<long>(1);

    [DisplayName("Increment"), Description("The amount to increment each record ID by. Defaults to 1.")]
    public InArgument<long> Increment { get; set; } = new InArgument<long>(1);

    [DisplayName("Updated Data Table"), Description("The data table with the added record ID column.")]
    public OutArgument<DataTable> UpdatedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var columnName = ColumnName.Get(context);
            var startAt = StartAt.Get(context);
            var increment = Increment.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");

            var name = string.IsNullOrWhiteSpace(columnName) ? "RecordID" : columnName.Trim();
            if (increment == 0)
                throw new ArgumentException("Increment cannot be zero.");

            var resultTable = dataTable.Copy();
            if (resultTable.Columns.Contains(name))
                throw new ArgumentException($"A column named '{name}' already exists in the data table.");
            resultTable.Columns.Add(name, typeof(long));

            var current = startAt;
            foreach (DataRow row in resultTable.Rows)
            {
                row[name] = current;
                current += increment;
            }

            UpdatedDataTable.Set(context, resultTable);
            status = $"Successfully added record ID column '{name}' with {resultTable.Rows.Count} rows.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            UpdatedDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error adding record ID: {ex.Message}");
        }
    }
}
