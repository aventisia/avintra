using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Update Data Table Item"), Description("Updates a data table row item on a defined column.")]
    public sealed class UpdateDataTableItemActivity : CodeActivity
    {
        [Category("Input"), DisplayName("Data Table"), Description("The data table to update.")]
        public InArgument<DataTable> DataTable { get; set; }

        [Category("Input"), DisplayName("RowIndex"), Description("The index of the row to update.")]
        public InArgument<int> RowIndex { get; set; }

        [Category("Input"), DisplayName("ColumnName"), Description("The name of the column to update.")]
        public InArgument<string> ColumnName { get; set; }

        [Category("Input"), DisplayName("NewValue"), Description("The new value to set for the cell.")]
        public InArgument<object> NewValue { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var dataTable = context.GetValue(DataTable);
            var rowIndex = context.GetValue(RowIndex);
            var columnName = context.GetValue(ColumnName);
            var newValue = context.GetValue(NewValue);

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

            if (string.IsNullOrEmpty(columnName) || !dataTable.Columns.Contains(columnName))
            {
                context.SetValue(StatusMessage, "Error: Invalid column name.");
                return;
            }

            try
            {
                dataTable.Rows[rowIndex][columnName] = newValue;
                context.SetValue(StatusMessage, "Cell updated successfully.");
            }
            catch (Exception ex)
            {
                context.SetValue(StatusMessage, $"Error: {ex.Message}");
            }
        }
    }
}