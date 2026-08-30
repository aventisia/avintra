using System.Data;
using NodeLibrary.DataTableNodes.Enums;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Delete Column From Data Table"), Description("Deletes a data table column at the specified column index or column name.")]
[NodeMetadata(icon: "/assets/DataTable.svg")]
public sealed class DeleteColumnFromDataTableNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to modify.")]
    public InArgument<DataTable> DataTable { get; set; } = new InArgument<DataTable>();

    [DisplayName("Specify Column With"), Description("Specifies whether to delete the column by name or index.")]
    public InArgument<DataTableDeleteColumnByEnum> SpecifyColumnWith { get; set; } = new InArgument<DataTableDeleteColumnByEnum>(DataTableDeleteColumnByEnum.Name);

    [DisplayName("Column Name"), Description("The name of the column to delete (required if 'Specify Column With' is 'Name').")]
    [RenderIfCondition(nameof(SpecifyColumnWith), DataTableDeleteColumnByEnum.Name)]
    public InArgument<string> ColumnName { get; set; } = new InArgument<string>();

    [DisplayName("Column Index"), Description("The zero-based index of the column to delete (required if 'Specify Column With' is 'Index').")]
    [RenderIfCondition(nameof(SpecifyColumnWith), DataTableDeleteColumnByEnum.Index)]
    public InArgument<int> ColumnIndex { get; set; }

    [DisplayName("Modified Data Table"), Description("Returns the updated data table after the column is deleted.")]
    public OutArgument<DataTable> ModifiedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var dataTable = DataTable.Get(context);
            var specifyColumnWith = SpecifyColumnWith.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");

            // Clone the input table to avoid mutating the original
            var resultTable = dataTable.Copy();

            switch (specifyColumnWith)
            {
                case DataTableDeleteColumnByEnum.Name:
                    {
                        var columnName = ColumnName.Get(context);

                        if (string.IsNullOrWhiteSpace(columnName))
                            throw new ArgumentException("Column name cannot be empty when using 'Name' mode.");

                        if (!resultTable.Columns.Contains(columnName))
                            throw new ArgumentException($"Column '{columnName}' not found in the data table.");

                        resultTable.Columns.Remove(columnName);
                        status = $"Successfully deleted column '{columnName}'.";
                        break;
                    }

                case DataTableDeleteColumnByEnum.Index:
                    {
                        var columnIndex = ColumnIndex.Get(context);

                        if (columnIndex < 0 || columnIndex >= resultTable.Columns.Count)
                            throw new ArgumentException($"Invalid column index: {columnIndex}. Valid range is 0 to {resultTable.Columns.Count - 1}.");

                        resultTable.Columns.RemoveAt(columnIndex);
                        status = $"Successfully deleted column at index {columnIndex}.";
                        break;
                    }

                default:
                    throw new ArgumentOutOfRangeException(nameof(specifyColumnWith));
            }

            // Set outputs
            ModifiedDataTable.Set(context, resultTable);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ModifiedDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error deleting column: {ex.Message}");
        }
    }
}
