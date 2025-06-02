using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Create Data Table")]
    [Description("Creates a new data table. If an existing data table is provided, it will be cloned.")]
    public class CreateDataTableActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [Category("Input")]
        [DisplayName("Data Table (Optional)")]
        [Description("An optional input data table to clone or use as a template.")]
        public InArgument<DataTable> DataTable { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
        [DisplayName("New Data Table")]
        [Description("The newly created or cloned data table.")]
        public OutArgument<DataTable> NewDataTable { get; set; }

        [Category("Output")]
        

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            string status = "Operation completed successfully.";
            DataTable resultTable = null;

            try
            {
                var inputTable = DataTable.Get(context);

                if (inputTable != null)
                {
                    // Clone both schema and data
                    resultTable = inputTable.Copy();
                    status +=
                        $" Cloned input data table with {resultTable.Rows.Count} rows and {resultTable.Columns.Count} columns.";
                }
                else
                {
                    // Create a new empty data table
                    resultTable = new DataTable();
                    status += " Created a new empty data table.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error creating data table: {ex.Message}";
            }

            NewDataTable.Set(context, resultTable);
            StatusMessage.Set(context, status);
        }
    }
}