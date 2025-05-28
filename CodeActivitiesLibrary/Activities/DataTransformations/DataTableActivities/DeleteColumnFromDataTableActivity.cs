using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Delete Column From Data Table"),
     Description("Deletes a data table column at the specified column index or column name.")]
    public sealed class DeleteColumnFromDataTableActivity : CodeActivity
    {
        [Category("Input"), DisplayName("Data Table"), Description("The data table to modify.")]
        public InArgument<DataTable> DataTable { get; set; }

        [Category("Input"), DisplayName("ColumnName"), Description("The name of the column to delete.")]
        public InArgument<string> ColumnName { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var dataTable = context.GetValue(DataTable);
            var columnName = context.GetValue(ColumnName);

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
                dataTable.Columns.Remove(columnName);
                context.SetValue(StatusMessage, "Column deleted successfully.");
            }
            catch (Exception ex)
            {
                context.SetValue(StatusMessage, $"Error: {ex.Message}");
            }
        }
    }
}