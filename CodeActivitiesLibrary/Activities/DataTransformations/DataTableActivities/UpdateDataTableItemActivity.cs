using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Update Data Table Item")]
    [Description("Updates a specific cell in a DataTable by specifying the column, row, and new value.")]
    public class UpdateDataTableItemActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Data Table")]
        [Description("The DataTable containing the data to be updated.")]
        public InArgument<DataTable> DataTable { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Column")]
        [Description("The name of the column where the update should occur.")]
        public InArgument<string> Column { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Row")]
        [Description("The row index or primary key value of the row to update.")]
        public InArgument<int> Row { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("New Value")]
        [Description("The new value to set for the specified cell.")]
        public InArgument<object> NewValue { get; set; }

        [Category("Output")]
        [DisplayName("Modified Data Table")]
        [Description("The DataTable after the specified cell has been updated.")]
        public OutArgument<DataTable> ModifiedDataTable { get; set; }

        [Category("Output")] 

        protected override void Execute(CodeActivityContext context)
        {
            // Retrieve input values
            var dataTable = context.GetValue(DataTable);
            var columnName = context.GetValue(Column);
            var rowIndex = context.GetValue(Row);
            var newValue = context.GetValue(NewValue);

            // Validate inputs
            if (dataTable == null)
            {
                throw new ArgumentException("Data table cannot be null.");
            }

            if (string.IsNullOrWhiteSpace(columnName))
            {
                throw new ArgumentException("Column name cannot be null or empty.");
            }

            if (!dataTable.Columns.Contains(columnName))
            {
                throw new ArgumentException($"Column '{columnName}' does not exist in the data table.");
            }

            if (rowIndex < 0 || rowIndex >= dataTable.Rows.Count)
            {
                throw new IndexOutOfRangeException($"Row index {rowIndex} is out of range.");
            }

            try
            {
                // Update the specified cell
                dataTable.Rows[rowIndex][columnName] = newValue;

                // Set outputs
                context.SetValue(ModifiedDataTable, dataTable);
                context.SetValue(StatusMessage, $"Successfully updated cell at Row {rowIndex}, Column '{columnName}'.");
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to update cell: {ex.Message}", ex);
            }
        }
    }
}