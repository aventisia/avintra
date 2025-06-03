using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Clear Data Table")]
    [Description("Removes all rows from a data table while preserving its structure.")]
    public class ClearDataTableActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]

        [DisplayName("Data Table")]
        [Description("The data table variable to clear. Must have been previously created or assigned.")]
        public InArgument<DataTable> DataTable { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            string status = "Operation completed successfully.";

            try
            {
                var dataTable = DataTable.Get(context);

                if (dataTable == null)
                    throw new ArgumentException("Data table cannot be null.");

                // Clear all rows in the data table
                dataTable.Clear();

                status = "Successfully cleared all rows from the data table.";
            }
            catch (Exception ex)
            {
                status = $"Error clearing data table: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}