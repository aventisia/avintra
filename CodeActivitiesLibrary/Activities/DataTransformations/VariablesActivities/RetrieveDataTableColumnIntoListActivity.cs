using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Retrieve Data Table Column Into List")]
    [Description(
        "Extracts data from a specified column of a data table into a list. The column can be identified by name or index.")]
    public class RetrieveDataTableColumnIntoListActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Data Table")]
        [Description("The data table containing the column to convert into a list.")]
        public InArgument<DataTable> DataTable { get; set; }

        [RequiredArgument]
        [DisplayName("Column Name or Index")]
        [Description("Specifies which column to extract by name (if defined) or index (zero-based).")]
        public InArgument<string> ColumnNameOrIndex { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Column as List")]
        [Description("Returns the contents of the selected column as a list of strings.")]
        public OutArgument<List<string>> ColumnAsList { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var dataTable = DataTable.Get(context);
                var columnNameOrIndex = ColumnNameOrIndex.Get(context);

                if (dataTable == null || dataTable.Columns.Count == 0)
                    throw new ArgumentException("DataTable must contain at least one column.");

                DataColumn column = null;

                // Try parse as index
                if (int.TryParse(columnNameOrIndex, out var columnIndex))
                {
                    if (columnIndex < 0 || columnIndex >= dataTable.Columns.Count)
                        throw new ArgumentOutOfRangeException(nameof(columnIndex),
                            $"Column index must be between 0 and {dataTable.Columns.Count - 1}");

                    column = dataTable.Columns[columnIndex];
                }
                else
                {
                    if (!dataTable.Columns.Contains(columnNameOrIndex))
                        throw new ArgumentException($"Column '{columnNameOrIndex}' not found in DataTable.");

                    column = dataTable.Columns[columnNameOrIndex];
                }

                var result = (from DataRow row in dataTable.Rows
                              select row[column] as object
                    into value
                              select value?.ToString() ?? string.Empty).ToList();

                ColumnAsList.Set(context, result);
                status = $"Successfully extracted {result.Count} items from column '{column.ColumnName}'.";
            }
            catch (Exception ex)
            {
                status = $"Error retrieving column into list: {ex.Message}";
                ColumnAsList.Set(context, new List<string>());
            }

            StatusMessage.Set(context, status);
        }
    }
}