using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Clear Data Table")]
    [Description("Removes all rows from a data table.")]
    public class ClearDataTableActivity : CodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Data Table")]
        [Description("The data table variable to clear. Must have been previously created or assigned.")]
        public InArgument<DataTable> DataTable { get; set; }

        #endregion

        #region Outputs

        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var dataTable = DataTable.Get(context);

                if (dataTable == null)
                    throw new ArgumentException("Data table cannot be null.");

                // Clear all rows
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