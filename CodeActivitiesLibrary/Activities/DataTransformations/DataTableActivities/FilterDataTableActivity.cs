using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Filter Data Table"), Description("Filters the data table rows based on the applied rules.")]
    public sealed class FilterDataTableActivity : CodeActivity
    {
        [Category("Input"), DisplayName("Data Table"), Description("The data table to filter.")]
        public InArgument<DataTable> DataTable { get; set; }

        [Category("Input"), DisplayName("FilterExpression"), Description("The filter expression (e.g., \"Age > 30\").")]
        public InArgument<string> FilterExpression { get; set; }

        [Category("Output"), DisplayName("Filtered Data Table"), Description("The filtered data table.")]
        public OutArgument<DataTable> FilteredDataTable { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var dataTable = context.GetValue(DataTable);
            var filterExpression = context.GetValue(FilterExpression);

            if (dataTable == null)
            {
                context.SetValue(StatusMessage, "Error: Data table is null.");
                return;
            }

            if (string.IsNullOrEmpty(filterExpression))
            {
                context.SetValue(StatusMessage, "Error: Filter expression is required.");
                return;
            }

            try
            {
                var filteredTable = dataTable.Select(filterExpression).CopyToDataTable();
                context.SetValue(FilteredDataTable, filteredTable);
                context.SetValue(StatusMessage, "Data table filtered successfully.");
            }
            catch (Exception ex)
            {
                context.SetValue(StatusMessage, $"Error: {ex.Message}");
            }
        }
    }
}