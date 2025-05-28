using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Delete Empty Rows From Data Table"),
     Description("Deletes the rows of the data table that have all of their cells empty.")]
    public sealed class DeleteEmptyRowsFromDataTableActivity : CodeActivity
    {
        [Category("Input"), DisplayName("Data Table"), Description("The data table to process.")]
        public InArgument<DataTable> DataTable { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var dataTable = context.GetValue(DataTable);

            if (dataTable == null)
            {
                context.SetValue(StatusMessage, "Error: Data table is null.");
                return;
            }

            try
            {
                for (var i = dataTable.Rows.Count - 1; i >= 0; i--)
                {
                    var isEmpty = true;
                    foreach (DataColumn column in dataTable.Columns)
                    {
                        if (dataTable.Rows[i][column] != DBNull.Value &&
                            !string.IsNullOrEmpty(dataTable.Rows[i][column]?.ToString()))
                        {
                            isEmpty = false;
                            break;
                        }
                    }

                    if (isEmpty)
                    {
                        dataTable.Rows.RemoveAt(i);
                    }
                }

                context.SetValue(StatusMessage, "Empty rows deleted successfully.");
            }
            catch (Exception ex)
            {
                context.SetValue(StatusMessage, $"Error: {ex.Message}");
            }
        }
    }
}