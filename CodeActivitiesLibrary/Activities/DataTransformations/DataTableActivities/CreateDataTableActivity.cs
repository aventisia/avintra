using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Create Data Table")]
    [Description("Creates a new data table. If an existing data table is provided, it will be cloned.")]
    public class CreateDataTableActivity : CodeActivity
    {
        #region Inputs

        [Category("Input")]
        [DisplayName("Data Table (Optional)")]
        [Description("An optional input data table to clone or use as a template.")]
        public InArgument<DataTable> DataTable { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var inputTable = DataTable.Get(context);

                // Create or clone the data table
                DataTable resultTable;

                if (inputTable != null)
                {
                    resultTable = inputTable.Copy(); // Clone structure and rows
                    status +=
                        $" Cloned input data table with {resultTable.Rows.Count} rows and {resultTable.Columns.Count} columns.";
                }
                else
                {
                    resultTable = new DataTable();
                    status += " Created a new empty data table.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error creating data table: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        #region Outputs

        [Category("Output")]
        [DisplayName("New Data Table Output")]
        [Description("The newly created or cloned data table.")]
        public OutArgument<DataTable> ODataTableOutput { get; set; }

        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion
    }
}