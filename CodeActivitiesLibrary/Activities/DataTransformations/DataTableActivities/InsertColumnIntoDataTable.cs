using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Insert Column Into Data Table"),
     Description("Inserts a column at the end or before a specific index value.")]
    public sealed class InsertColumnIntoDataTable : CodeActivity
    {
        [Category("Input"), DisplayName("Data Table"), Description("The data table to modify.")]
        public InArgument<DataTable> DataTable { get; set; }

        [Category("Input"), DisplayName("ColumnName"), Description("The name of the new column.")]
        public InArgument<string> ColumnName { get; set; }

        [Category("Input"), DisplayName("DataType"), Description("The data type of the new column.")]
        public InArgument<Type> DataType { get; set; }

        [Category("Input"), DisplayName("ColumnIndex"),
         Description("The index at which to insert the column. Use -1 to append at the end.")]
        public InArgument<int> ColumnIndex { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var dataTable = context.GetValue(DataTable);
            var columnName = context.GetValue(ColumnName);
            var dataType = context.GetValue(DataType);
            var columnIndex = context.GetValue(ColumnIndex);

            if (dataTable == null)
            {
                context.SetValue(StatusMessage, "Error: Data table is null.");
                return;
            }

            if (string.IsNullOrEmpty(columnName))
            {
                context.SetValue(StatusMessage, "Error: Column name is required.");
                return;
            }

            try
            {
                var newColumn = new DataColumn(columnName, dataType);

                if (columnIndex == -1)
                {
                    dataTable.Columns.Add(newColumn);
                }
                else
                {
                    dataTable.Columns.Add(newColumn);
                }

                context.SetValue(StatusMessage, "Column inserted successfully.");
            }
            catch (Exception ex)
            {
                context.SetValue(StatusMessage, $"Error: {ex.Message}");
            }
        }
    }
}