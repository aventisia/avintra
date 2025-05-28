using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Delete Duplicate Rows From Data Table"),
     Description(
         "Deletes all the rows that are duplicate from the data table, if the values have the same data type in each column.")]
    public sealed class DeleteDuplicateRowsFromDataTable : CodeActivity
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
                // Use a HashSet to track unique rows
                var uniqueRows = new HashSet<string>();
                for (var i = dataTable.Rows.Count - 1; i >= 0; i--)
                {
                    var rowKey = string.Join(",", dataTable.Rows[i].ItemArray);
                    if (!uniqueRows.Add(rowKey))
                    {
                        dataTable.Rows.RemoveAt(i);
                    }
                }

                context.SetValue(StatusMessage, "Duplicate rows deleted successfully.");
            }
            catch (Exception ex)
            {
                context.SetValue(StatusMessage, $"Error: {ex.Message}");
            }
        }
    }
}