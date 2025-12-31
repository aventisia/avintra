using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Filter Data Table")]
    [Description("Filters the data table rows based on the applied rules.")]
    [ActivityMetaData(nodeImg: "/assets/DataTable.svg")]
    public sealed class FilterDataTableActivity : BaseCodeActivity
    {
       // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Data Table")]
        [Description("The data table to filter.")]
        public InArgument<DataTable> DataTable { get; set; }

        [RequiredArgument]
        [DisplayName("Filter Expression")]
        [Description("The filter expression (e.g., \"Age > 30\").")]
        public InArgument<string> FilterExpression { get; set; }


        [DisplayName("Match Case")]
        [Description("If true, performs a case-sensitive filter.")]
        [DefaultValue(false)]
        public InArgument<bool> MatchCase { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------
       

        [DisplayName("Filtered Data Table")]
        [Description("The filtered data table.")]
        public OutArgument<DataTable> FilteredDataTable { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
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
                IsSuccess.Set(context, true);
                StatusMessage.Set(context,
                    $"Successfully filtered data table. Rows matched: {filteredTable.Rows.Count}");
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
    
    internal static class DataTableHelper
    {
        /// <summary>
        /// Filters the DataTable rows based on a filter expression and case sensitivity.
        /// </summary>
        public static DataRow[] CaseSensitiveSelectMethod(DataTable table, string filterExpression, bool matchCase)
        {
            if (table == null)
                throw new ArgumentNullException(nameof(table));
            if (string.IsNullOrWhiteSpace(filterExpression))
                throw new ArgumentException("Filter expression cannot be empty.", nameof(filterExpression));

            if (!matchCase)
                return table.Select(filterExpression);

            // Use case-sensitive comparison by temporarily setting CaseSensitive = true
            var originalCaseSensitivity = table.CaseSensitive;
            try
            {
                table.CaseSensitive = true;
                return table.Select(filterExpression);
            }
            finally
            {
                table.CaseSensitive = originalCaseSensitivity;
            }
        }
    }
}