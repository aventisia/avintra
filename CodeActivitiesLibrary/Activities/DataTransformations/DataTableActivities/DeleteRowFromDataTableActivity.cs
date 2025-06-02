using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Delete Row From Data Table")]
    [Description("Deletes a row from a data table based on its zero-based index.")]
    public sealed class DeleteRowFromDataTableActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Data Table")]
        [Description("The data table from which the row will be deleted.")]
        public InArgument<DataTable> DataTable { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Row Index")]
        [Description("The zero-based index of the row to delete.")]
        public InArgument<int> RowIndex { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
        [DisplayName("Modified Data Table")]
        [Description("Returns the updated data table after the row is deleted.")]
        public OutArgument<DataTable> ModifiedDataTable { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            string status = "Operation completed successfully.";

            try
            {
                var dataTable = DataTable.Get(context);
                var rowIndex = RowIndex.Get(context);

                if (dataTable == null)
                    throw new ArgumentException("Data table cannot be null.");

                if (rowIndex < 0 || rowIndex >= dataTable.Rows.Count)
                    throw new ArgumentOutOfRangeException(nameof(rowIndex),
                        $"Row index must be between 0 and {dataTable.Rows.Count - 1}.");

                // Delete the specified row
                dataTable.Rows.RemoveAt(rowIndex);

                // Set outputs
                ModifiedDataTable.Set(context, dataTable);
                status = $"Successfully deleted row at index {rowIndex}.";
            }
            catch (Exception ex)
            {
                status = $"Error deleting row: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}