using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Retrieve Data Table Column Into List")]
    [Description(
        "Extracts data from a specified column of a data table into a list. The column can be identified by name or index.")]
    public class RetrieveDataTableColumnIntoListActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Data Table")]
        [Description("The data table with the column to convert into a list.")]
        public InArgument<DataTable> DataTable { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Column Name or Index")]
        [Description("The column name (if defined) or index number to retrieve.")]
        public InArgument<string> ColumnNameOrIndex { get; set; }


        [Category("Output")]
        [DisplayName("Column as List Output")]
        [Description("The new list containing the contents of the specified data table column.")]
        public OutArgument<List<string>> ColumnAsListOutput { get; set; }


        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var dataTable = DataTable.Get(context);
                var columnNameOrIndex = ColumnNameOrIndex.Get(context);

                if (dataTable == null)
                    throw new ArgumentException("Data table cannot be null.");

                if (string.IsNullOrWhiteSpace(columnNameOrIndex))
                    throw new ArgumentException("Column name or index must be specified.");

                // Parse column name/index
                DataColumn column = null;

                if (int.TryParse(columnNameOrIndex, out var columnIndex) && columnIndex >= 0 &&
                    columnIndex < dataTable.Columns.Count)
                    column = dataTable.Columns[columnIndex];
                else
                    column = dataTable.Columns[columnNameOrIndex];

                if (column == null)
                    throw new ArgumentException($"Column '{columnNameOrIndex}' not found in the data table.");

                // Extract values from column
                var result = new List<string>();
                foreach (DataRow row in dataTable.Rows)
                {
                    var value = row[column].ToString();
                    result.Add(value);
                }

                ColumnAsListOutput.Set(context, result);

                status += $" Retrieved column '{column.ColumnName}' into a list with {result.Count} items.";
            }
            catch (Exception ex)
            {
                status = $"Error retrieving column into list: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}