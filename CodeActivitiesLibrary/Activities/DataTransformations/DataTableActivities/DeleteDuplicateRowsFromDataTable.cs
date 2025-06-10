using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Delete Duplicate Rows From Data Table")]
    [Description("Deletes all rows that are exact duplicates from the data table.")]
    public sealed class DeleteDuplicateRowsFromDataTable : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Data Table")]
        [Description("The data table to process.")]
        public InArgument<DataTable> DataTable { get; set; }


        [DisplayName("Compare Mode")]
        [Description("Specifies whether to compare all columns or only selected ones.")]
        [DefaultValue(DataTableColumnCompareModeEnum.AllColumns)]
        public InArgument<DataTableColumnCompareModeEnum> CompareMode { get; set; }


        [DisplayName("Column Names To Compare")]
        [Description("List of column names to compare when 'Compare Mode' is 'Selected Columns'.")]
        [RenderIfCondition(nameof(CompareMode), DataTableColumnCompareModeEnum.SelectedColumns)]
        public InArgument<List<string>> ColumnNamesToCompare { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            string status = "Operation completed successfully.";

            try
            {
                var dataTable = DataTable.Get(context);
                var compareMode = CompareMode.Get(context);

                if (dataTable == null)
                    throw new ArgumentException("Data table cannot be null.");

                List<string> columnsToCompare;

                switch (compareMode)
                {
                    case DataTableColumnCompareModeEnum.AllColumns:
                        columnsToCompare = dataTable.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToList();
                        break;

                    case DataTableColumnCompareModeEnum.SelectedColumns:
                        columnsToCompare = ColumnNamesToCompare.Get(context);
                        if (columnsToCompare == null || !columnsToCompare.Any())
                            throw new ArgumentException("Column names to compare cannot be empty.");
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(compareMode));
                }

                // Validate all column names exist in the data table
                foreach (var colName in columnsToCompare)
                {
                    if (!dataTable.Columns.Contains(colName))
                        throw new ArgumentException($"Column '{colName}' not found in data table.");
                }

                // Remove duplicate rows
                var seen = new HashSet<string>();
                var uniqueRows = new List<DataRow>();

                foreach (DataRow row in dataTable.Rows)
                {
                    var key = string.Join("|", columnsToCompare.Select(c => row[c]));
                    if (seen.Add(key))
                        uniqueRows.Add(row);
                }

                // Clear original table and add back unique rows
                dataTable.Rows.Clear();

                foreach (var row in uniqueRows)
                {
                    dataTable.ImportRow(row);
                }
            }
            catch (Exception ex)
            {
                status = $"Error deleting duplicate rows: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}