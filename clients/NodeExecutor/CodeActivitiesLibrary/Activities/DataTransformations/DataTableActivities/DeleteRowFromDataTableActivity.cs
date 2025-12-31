using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Delete Row From Data Table")]
    [Description("Deletes a row from a data table based on its zero-based index.")]
    [ActivityMetaData(nodeImg: "/assets/DataTable.svg")]
    public sealed class DeleteRowFromDataTableActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Data Table")]
        [Description("The data table from which the row will be deleted.")]
        public InArgument<DataTable> DataTable { get; set; }

        [RequiredArgument]
        [DisplayName("Row Index")]
        [Description("The zero-based index of the row to delete.")]
        public InArgument<int> RowIndex { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Modified Data Table")]
        [Description("Returns the updated data table after the row is deleted.")]
        public OutArgument<DataTable> ModifiedDataTable { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var dataTable = DataTable.Get(context);
                var rowIndex = RowIndex.Get(context);

                if (dataTable == null)
                    throw new ArgumentException("Data table cannot be null.");

                if (dataTable.Rows.Count == 0)
                    throw new InvalidOperationException("Cannot delete row from an empty data table.");

                if (rowIndex < 0 || rowIndex >= dataTable.Rows.Count)
                    throw new ArgumentOutOfRangeException(nameof(rowIndex),
                        $"Row index must be between 0 and {dataTable.Rows.Count - 1}.");

                // Delete the specified row. Clone the table to avoid mutating the original
                var clonedTable = dataTable.Copy();
                clonedTable.Rows.RemoveAt(rowIndex);

                // Set outputs
                ModifiedDataTable.Set(context, clonedTable);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully deleted row at index {rowIndex}.");
            }
            catch (Exception ex)
            {
                ModifiedDataTable.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error deleting row: {ex.Message}");
            }
        }
    }
}