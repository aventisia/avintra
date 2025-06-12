using CodeActivitiesLibrary.DataTransformations.DataTableActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Delete Empty Rows From Data Table")]
    [Description("Deletes rows from a data table where one or more cells are empty.")]
    public sealed class DeleteEmptyRowsFromDataTableActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Data Table")]
        [Description("The data table containing the rows to process.")]
        public InArgument<DataTable> DataTable { get; set; }

        [RequiredArgument]
        [DisplayName("Empty Row Mode")]
        [Description("Specifies how to detect empty rows.")]
        [DefaultValue(DataTableEmptyRowModeEnum.AllEmpty)]
        public InArgument<DataTableEmptyRowModeEnum> EmptyRowMode { get; set; }


        [DisplayName("Column Names To Check")]
        [Description(
            "List of column names to check for emptiness (required if 'Empty Row Mode' is 'Based on Specific Columns').")]
        [RenderIfCondition(nameof(EmptyRowMode), DataTableEmptyRowModeEnum.SpecificColumns)]
        public InArgument<List<string>> ColumnNamesToCheck { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var dataTable = DataTable.Get(context);
                var emptyRowMode = EmptyRowMode.Get(context);

                if (dataTable == null)
                    throw new ArgumentException("Data table cannot be null.");

                List<string> columnsToCheck = null;
                switch (emptyRowMode)
                {
                    case DataTableEmptyRowModeEnum.SpecificColumns:
                        columnsToCheck = ColumnNamesToCheck.Get(context);
                        if (columnsToCheck == null || !columnsToCheck.Any())
                            throw new ArgumentException("Column names to check cannot be empty.");
                        break;

                    case DataTableEmptyRowModeEnum.AllEmpty:
                    case DataTableEmptyRowModeEnum.AnyEmpty:
                        columnsToCheck = dataTable.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToList();
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(emptyRowMode));
                }

                // Validate that all specified columns exist in the data table
                foreach (var colName in columnsToCheck)
                    if (!dataTable.Columns.Contains(colName))
                        throw new ArgumentException($"Column '{colName}' not found in the data table.");

                // Loop through rows in reverse to allow safe removal
                for (var i = dataTable.Rows.Count - 1; i >= 0; i--)
                {
                    var row = dataTable.Rows[i];

                    bool isEmpty;
                    switch (emptyRowMode)
                    {
                        case DataTableEmptyRowModeEnum.AllEmpty:
                            isEmpty = columnsToCheck.All(col => IsCellEmpty(row[col]));
                            break;

                        case DataTableEmptyRowModeEnum.AnyEmpty:
                            isEmpty = columnsToCheck.Any(col => IsCellEmpty(row[col]));
                            break;

                        case DataTableEmptyRowModeEnum.SpecificColumns:
                            isEmpty = columnsToCheck.All(col => IsCellEmpty(row[col]));
                            break;

                        default:
                            throw new ArgumentOutOfRangeException(nameof(emptyRowMode));
                    }

                    if (isEmpty) dataTable.Rows.RemoveAt(i);
                }

                status = $"Successfully deleted {dataTable.Rows.Count} empty rows.";
            }
            catch (Exception ex)
            {
                status = $"Error deleting empty rows: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        private static bool IsCellEmpty(object cellValue)
        {
            return cellValue == null ||
                   cellValue is DBNull ||
                   string.IsNullOrEmpty(cellValue.ToString());
        }
    }
}