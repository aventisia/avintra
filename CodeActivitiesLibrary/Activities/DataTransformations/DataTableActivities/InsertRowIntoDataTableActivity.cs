using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Insert Row Into Data Table"),
     Description("Inserts a row at the end or before a specific index value.")]
    public sealed class InsertRowIntoDataTableActivity : CodeActivity
    {
        [Category("Input"), DisplayName("Data Table"), Description("The data table to which the row will be inserted.")]
        public InArgument<DataTable> DataTable { get; set; }

        [Category("Input"), DisplayName("Row Values"), Description("An array of values to insert into the row.")]
        public InArgument<object[]> RowValues { get; set; }

        [Category("Input"), DisplayName("RowIndex"),
         Description("The index before which the row should be inserted. Use -1 to append at the end.")]
        public InArgument<int> RowIndex { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var dataTable = context.GetValue(DataTable);
            var rowValues = context.GetValue(RowValues);
            var rowIndex = context.GetValue(RowIndex);

            if (dataTable == null)
            {
                context.SetValue(StatusMessage, "Error: Data table is null.");
                return;
            }

            if (rowValues == null)
            {
                context.SetValue(StatusMessage, "Error: Row values are null.");
                return;
            }

            try
            {
                var newRow = dataTable.NewRow();
                for (var i = 0; i < rowValues.Length; i++)
                {
                    newRow[i] = rowValues[i];
                }

                if (rowIndex == -1)
                {
                    dataTable.Rows.Add(newRow);
                }
                else
                {
                    dataTable.Rows.InsertAt(newRow, rowIndex);
                }

                context.SetValue(StatusMessage, "Row inserted successfully.");
            }
            catch (Exception ex)
            {
                context.SetValue(StatusMessage, $"Error: {ex.Message}");
            }
        }
    }
}