using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Clear Data Table")]
    [Description("Removes all rows from a data table while preserving its structure.")]
    public class ClearDataTableActivity : BaseCodeActivity
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
        // ----------------------        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var dataTable = DataTable.Get(context);

                if (dataTable == null)
                    throw new ArgumentException("Data table cannot be null.");

                // Clear all rows in the data table
                dataTable.Clear();
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Successfully cleared all rows from the data table.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error clearing data table: {ex.Message}");
            }

        }
    }
}