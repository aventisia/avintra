using System.Data;
using NodeLibrary.DataTableNodes.Enums;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Sort Data Table"), Description("Sorts the data table rows in ascending or descending order by the specified column.")]
[NodeMetadata(icon: "/assets/DataTable.svg")]
public class SortDataTableNode : BaseNode
{
    [DisplayName("Data Table"), Description("The DataTable containing the data to be sorted.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Specify Column With"), Description("Choose whether to specify the column by name or index.")]
    public InArgument<DataTableSortColumnByEnum> SpecifyColumnWith { get; set; } = new InArgument<DataTableSortColumnByEnum>(DataTableSortColumnByEnum.Name);

    [DisplayName("Column Name"), Description("The name of the column to sort by (used when 'Specify Column With' is set to 'Name').")]
    [RenderIfCondition(nameof(SpecifyColumnWith), DataTableSortColumnByEnum.Name)]
    public InArgument<string> ColumnName { get; set; } = new InArgument<string>();

    [DisplayName("Column Index"), Description("The index of the column to sort by (used when 'Specify Column With' is set to 'Index').")]
    [RenderIfCondition(nameof(SpecifyColumnWith), DataTableSortColumnByEnum.Index)]
    public InArgument<int> ColumnIndex { get; set; } = new InArgument<int>(0);

    [DisplayName("Order"), Description("Specifies whether to sort in ascending or descending order.")]
    public InArgument<SortOrderEnum> Order { get; set; } = new InArgument<SortOrderEnum>(SortOrderEnum.Ascending);

    [DisplayName("Sorted Data Table"), Description("The DataTable after it has been sorted based on the specified criteria.")]
    public OutArgument<DataTable> SortedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            // Retrieve input values
            var dataTable = DataTable.Get(context);
            var specifyColumnWith = SpecifyColumnWith.Get(context);
            var columnName = ColumnName.Get(context);
            var columnIndex = ColumnIndex.Get(context);
            var sortOrder = Order.Get(context);

            // Validate inputs
            if (dataTable == null) throw new ArgumentException("Data table cannot be null.");

            string? sortColumnName = null;

            switch (specifyColumnWith)
            {
                case DataTableSortColumnByEnum.Name:
                    if (string.IsNullOrWhiteSpace(columnName))
                        throw new ArgumentException("Column name cannot be null or empty.");

                    if (!dataTable.Columns.Contains(columnName))
                        throw new ArgumentException($"Column '{columnName}' does not exist in the data table.");

                    sortColumnName = columnName;
                    break;

                case DataTableSortColumnByEnum.Index:
                    if (columnIndex < 0 || columnIndex >= dataTable.Columns.Count)
                        throw new IndexOutOfRangeException($"Column index {columnIndex} is out of range.");

                    sortColumnName = dataTable.Columns[columnIndex].ColumnName;
                    break;

                default:
                    throw new ArgumentException($"Unsupported column specification mode: {specifyColumnWith}");
            }

            // Clone the original DataTable to avoid modifying the input
            var sortedDataTable = dataTable.Clone();

            // Sort the DataTable using LINQ - handle null values properly
            var sortedRows = dataTable.AsEnumerable()
                .OrderBy(row => row[sortColumnName] == DBNull.Value ? null : row[sortColumnName])
                .Select(row => row.ItemArray)
                .ToArray();

            if (sortOrder == SortOrderEnum.Descending) sortedRows = sortedRows.Reverse().ToArray();

            // Add sorted rows to the cloned DataTable
            foreach (var rowArray in sortedRows) sortedDataTable.LoadDataRow(rowArray, true);

            // Set outputs
            SortedDataTable.Set(context, sortedDataTable);
            status = $"Successfully sorted the data table by column '{sortColumnName}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            SortedDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Failed to sort the data table: {ex.Message}");
        }
    }

    public enum SortOrderEnum
    {
        [Display(Name = "Ascending", Description = "Sort in ascending order.")]
        Ascending = 0,

        [Display(Name = "Descending", Description = "Sort in descending order.")]
        Descending = 1
    }
}
