using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    // Activity to filter cells in an Excel worksheet
    [DisplayName("Filter Cells in Excel Worksheet"), Description(
         "Filter cells in an Excel worksheet allows makers to create and apply a filter in the active sheet, table, or range on the values of a specified column. To filter multiple columns in an active sheet/table/range, multiple Filter Cells in Excel Worksheet actions must be used, each one applying the respective filter.")]
    public class FilterCellsInExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The column to filter by.")]
        public InArgument<string> ColumnToFilter { get; set; }

        [RequiredArgument, Category("Input"), Description(@"The filter criteria (e.g., '>10', 'Contains `Apple`').")]
        public InArgument<string> FilterCriteria { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var columnToFilter = ColumnToFilter.Get(context);
            var filterCriteria = FilterCriteria.Get(context);
            var status = "";

            try
            {
                // Simulate filtering cells (actual implementation would use Excel Interop or similar)
                status =
                    $"Simulated filtering of column '{columnToFilter}' with criteria '{filterCriteria}' in Excel instance '{excelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error filtering cells: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}