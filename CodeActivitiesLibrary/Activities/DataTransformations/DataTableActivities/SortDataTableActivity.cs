using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Sort Data Table"),
     Description(
         "Sorts the data table rows in ascending or descending order by the specified column, if all its values have the same data type.")]
    public sealed class SortDataTableActivity : CodeActivity
    {
        [Category("Input"), DisplayName("Data Table"), Description("The data table to sort.")]
        public InArgument<DataTable> DataTable { get; set; }

        [Category("Input"), DisplayName("ColumnName"), Description("The name of the column to sort by.")]
        public InArgument<string> ColumnName { get; set; }

        [Category("Input"), DisplayName("Ascending"),
         Description("Sort in ascending order. Set to false for descending order.")]
        public InArgument<bool> Ascending { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var dataTable = context.GetValue(DataTable);
            var columnName = context.GetValue(ColumnName);
            var ascending = context.GetValue(Ascending);

            if (dataTable == null)
            {
                context.SetValue(StatusMessage, "Error: Data table is null.");
                return;
            }

            if (string.IsNullOrEmpty(columnName) || !dataTable.Columns.Contains(columnName))
            {
                context.SetValue(StatusMessage, "Error: Invalid column name.");
                return;
            }

            try
            {
                dataTable.DefaultView.Sort = $"{columnName} {(ascending ? "ASC" : "DESC")}";
                dataTable = dataTable.DefaultView.ToTable();
                context.SetValue(StatusMessage, "Data table sorted successfully.");
            }
            catch (Exception ex)
            {
                context.SetValue(StatusMessage, $"Error: {ex.Message}");
            }
        }
    }
}