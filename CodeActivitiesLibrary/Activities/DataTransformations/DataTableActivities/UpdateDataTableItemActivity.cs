using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Update Data Table Item")]
    [Description("Updates a specific cell in a DataTable by specifying the column, row, and new value.")]
    public class UpdateDataTableItemActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Data Table")]
        [Description("The DataTable containing the data to be updated.")]
        public InArgument<DataTable> DataTable { get; set; }

        [RequiredArgument]
        [DisplayName("Column")]
        [Description("The name of the column where the update should occur.")]
        public InArgument<string> Column { get; set; }

        [RequiredArgument]
        [DisplayName("Row")]
        [Description("The row index or primary key value of the row to update.")]
        public InArgument<int> Row { get; set; }

        [RequiredArgument]
        [DisplayName("New Value")]
        [Description("The new value to set for the specified cell.")]
        public InArgument<object> NewValue { get; set; }


        [DisplayName("Modified Data Table")]
        [Description("The DataTable after the specified cell has been updated.")]
        public OutArgument<DataTable> ModifiedDataTable { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            // Retrieve input values
            var dataTable = context.GetValue(DataTable);
            var columnName = context.GetValue(Column);
            var rowIndex = context.GetValue(Row);
            var newValue = context.GetValue(NewValue);

            // Validate inputs
            if (dataTable == null) throw new ArgumentException("Data table cannot be null.");

            if (string.IsNullOrWhiteSpace(columnName))
                throw new ArgumentException("Column name cannot be null or empty.");

            if (!dataTable.Columns.Contains(columnName))
                throw new ArgumentException($"Column '{columnName}' does not exist in the data table.");

            if (rowIndex < 0 || rowIndex >= dataTable.Rows.Count)
                throw new IndexOutOfRangeException($"Row index {rowIndex} is out of range.");

            try
            {
                // Update the specified cell
                dataTable.Rows[rowIndex][columnName] = newValue;

                // Set outputs
                ModifiedDataTable.Set(context, dataTable);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully updated cell at Row {rowIndex}, Column '{columnName}'.");
            }
            catch (Exception ex)
            {
                ModifiedDataTable.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to update cell: {ex.Message}");
            }
        }
    }
}