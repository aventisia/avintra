using System.Data;
using NodeLibrary.DataTableNodes.Helpers;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Filter Data Table"), Description("Filters the data table rows based on the applied rules.")]
[NodeMetadata(icon: "/assets/DataTable.svg")]
public sealed class FilterDataTableNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to filter.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Filter Expression"), Description("The filter expression (e.g., \"Age > 30\").")]
    public required InArgument<string> FilterExpression { get; set; }

    [DisplayName("Match Case"), Description("If true, performs a case-sensitive filter.")]
    public InArgument<bool> MatchCase { get; set; } = new InArgument<bool>(false);

    [DisplayName("Filtered Data Table"), Description("The filtered data table.")]
    public OutArgument<DataTable> FilteredDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var dataTable = DataTable.Get(context);
            var filterExpression = FilterExpression.Get(context);
            var matchCase = MatchCase.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");

            if (string.IsNullOrWhiteSpace(filterExpression))
                throw new ArgumentException("Filter expression cannot be empty.");

            // Apply filtering
            var filteredRows = DataTableHelper.CaseSensitiveSelectMethod(dataTable, filterExpression, matchCase);

            // Clone structure and import matching rows
            var filteredTable = dataTable.Clone();
            foreach (DataRow row in filteredRows)
            {
                filteredTable.ImportRow(row);
            }

            // Set outputs
            FilteredDataTable.Set(context, filteredTable);
            status = $"Successfully filtered data table. Rows matched: {filteredTable.Rows.Count}";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            // Handle error
            FilteredDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error filtering data table: {ex.Message}");
        }
    }
}
