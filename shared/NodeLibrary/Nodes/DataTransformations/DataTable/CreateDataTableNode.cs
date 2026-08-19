using System.Data;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Create Data Table"), Description("Creates a new data table. If an existing data table is provided, it will be cloned.")]
[NodeMetadata(icon: "/assets/DataTable.svg")]
public class CreateDataTableNode : BaseNode
{
    [DisplayName("Data Table (Optional)"), Description("An optional input data table to clone or use as a template.")]
    public InArgument<DataTable> DataTable { get; set; } = new InArgument<DataTable>();

    [DisplayName("Initial Columns (Optional)"), Description("An optional input to add initial columns in data table.")]
    public InArgument<bool> HasInitialColumns { get; set; } = new InArgument<bool>(false);

    [DisplayName("Data Table columns either number or comma seperated columns (Optional)"), Description("An optional input data table columns to add in data table.")]
    [RenderIfCondition(nameof(HasInitialColumns), true)]
    public InArgument<object> Columns { get; set; } = new InArgument<object>();

    [DisplayName("Empty Rows (Optional)"), Description("An optional input to add empty rows in data table.")]
    public InArgument<bool> HasEmptyRows { get; set; } = new InArgument<bool>(false);

    [DisplayName("Data Table rows (Optional)"), Description("An optional input empty rows to add in data table.")]
    [RenderIfCondition(nameof(HasEmptyRows), true)]
    public InArgument<int> EmptyRows { get; set; } = new InArgument<int>(1);

    [DisplayName("New Data Table"), Description("The newly created or cloned data table.")]
    public OutArgument<DataTable> NewDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        DataTable resultTable = null;

        try
        {
            var columns = Columns.Get(context);
            var hasInitialColumns = HasInitialColumns.Get(context);
            var hasEmptyRows = HasEmptyRows.Get(context);
            var emptyRows = EmptyRows.Get(context);
            var inputTable = DataTable.Get(context);

            if (inputTable != null)
            {
                // Clone both schema and data
                resultTable = inputTable.Copy();
                status = $"Cloned input data table with {resultTable.Rows.Count} rows and {resultTable.Columns.Count} columns.";
            }
            else
            {
                resultTable = new DataTable();

                if (hasInitialColumns && columns != null)
                {
                    if (columns is int columnCount)
                    {
                        for (var i = 0; i < columnCount; i++)
                            resultTable.Columns.Add($"Column{i + 1}");
                        status = $"Created data table with {columnCount} columns.";
                    }
                    else if (columns is string columnString)
                    {
                        var columnDefs = columnString.Split(',');
                        foreach (var colDef in columnDefs)
                        {
                            var parts = colDef.Trim().Split(':');
                            var columnName = parts[0].Trim();
                            var columnType = parts.Length > 1 ? parts[1].Trim() : "string";
                            
                            var dataType = columnType.ToLower() switch
                            {
                                "int" or "int32" => typeof(int),
                                "long" or "int64" => typeof(long),
                                "double" => typeof(double),
                                "decimal" => typeof(decimal),
                                "bool" or "boolean" => typeof(bool),
                                "date" or "datetime" => typeof(DateTime),
                                _ => typeof(string)
                            };
                            
                            resultTable.Columns.Add(columnName, dataType);
                        }
                        status = $"Created data table with {columnDefs.Length} columns.";
                    }
                }

                if (hasEmptyRows && emptyRows > 0)
                {
                    for (var i = 0; i < emptyRows; i++)
                        resultTable.Rows.Add(resultTable.NewRow());
                    status += $" Added {emptyRows} empty rows.";
                }
            }

            NewDataTable.Set(context, resultTable);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            NewDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error creating data table: {ex.Message}");
        }
    }
}
