using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Filter Data Table")]
    [Description("Filters the data table rows based on the applied rules.")]
    public sealed class FilterDataTableActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Data Table")]
        [Description("The data table to filter.")]
        public InArgument<DataTable> DataTable { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Filter Expression")]
        [Description("The filter expression (e.g., \"Age > 30\").")]
        public InArgument<string> FilterExpression { get; set; }

        [Category("Input")]
        [DisplayName("Match Case")]
        [Description("If true, performs a case-sensitive filter.")]
        public InArgument<bool> MatchCase { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
        [DisplayName("Filtered Data Table")]
        [Description("The filtered data table.")]
        public OutArgument<DataTable> FilteredDataTable { get; set; }

        [Category("Output")]
        

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            string status = "Operation completed successfully.";

            try
            {
                var dataTable = DataTable.Get(context);
                var filterExpression = FilterExpression.Get(context);
                var matchCase = MatchCase.Get(context);

                if (dataTable == null)
                    throw new ArgumentException("Data table cannot be null.");

                if (string.IsNullOrWhiteSpace(filterExpression))
                    throw new ArgumentException("Filter expression cannot be empty.");

                // Apply filter
                var filteredRows = dataTable.Select(filterExpression, matchCase ? "Binary" : "");

                // Create a new DataTable with the same schema
                var filteredTable = dataTable.Clone();

                // Copy filtered rows to the new DataTable
                foreach (DataRow row in filteredRows)
                {
                    filteredTable.ImportRow(row);
                }

                // Set outputs
                FilteredDataTable.Set(context, filteredTable);
                status = $"Filtered data table successfully. Rows matched: {filteredTable.Rows.Count}.";
            }
            catch (Exception ex)
            {
                status = $"Error filtering data table: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}