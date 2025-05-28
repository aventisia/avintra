using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Delete Row From Data Table"), Description("Deletes a data table row at the corresponding row index.")]
    public sealed class DeleteRowFromDataTableActivity : CodeActivity
    {
        [Category("Input"), DisplayName("Data Table"),
         Description("The data table from which the row will be deleted.")]
        public InArgument<DataTable> DataTable { get; set; }

        [Category("Input"), DisplayName("RowIndex"), Description("The index of the row to delete.")]
        public InArgument<int> RowIndex { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var dataTable = context.GetValue(DataTable);
            var rowIndex = context.GetValue(RowIndex);

            if (dataTable == null)
            {
                context.SetValue(StatusMessage, "Error: Data table is null.");
                return;
            }

            if (rowIndex < 0 || rowIndex >= dataTable.Rows.Count)
            {
                context.SetValue(StatusMessage, "Error: Invalid row index.");
                return;
            }

            try
            {
                dataTable.Rows.RemoveAt(rowIndex);
                context.SetValue(StatusMessage, "Row deleted successfully.");
            }
            catch (Exception ex)
            {
                context.SetValue(StatusMessage, $"Error: {ex.Message}");
            }
        }
    }
}