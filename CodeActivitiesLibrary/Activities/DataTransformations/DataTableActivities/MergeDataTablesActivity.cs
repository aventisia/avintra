using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Merge Data Tables")]
    [Description(
        "Merges two data tables together, specifying the merging behavior in case their columns are different.")]
    public class MergeDataTablesActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("First Data Table")]
        [Description("The first DataTable to be merged.")]
        public InArgument<DataTable> FirstDataTable { get; set; }

        [RequiredArgument]
        [DisplayName("Second Data Table")]
        [Description("The second DataTable to be merged.")]
        public InArgument<DataTable> SecondDataTable { get; set; }

        [RequiredArgument]
        [DisplayName("Merge Mode")]
        [Description(
            "Specifies how to handle columns that are present in the second table but not in the first table.")]
        public InArgument<DataTableMergeModeEnum> MergeMode { get; set; } =
            new InArgument<DataTableMergeModeEnum>(DataTableMergeModeEnum.AddExtraColumns);


        [DisplayName("Merged Data Table")]
        [Description("The resulting DataTable after merging the two input Data Tables.")]
        public OutArgument<DataTable> MergedDataTable { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            // Retrieve input values
            var firstDataTable = context.GetValue(FirstDataTable);
            var secondDataTable = context.GetValue(SecondDataTable);
            var mergeMode = context.GetValue(MergeMode);

            // Validate inputs
            if (firstDataTable == null) throw new ArgumentException("First Data Table cannot be null.");

            if (secondDataTable == null) throw new ArgumentException("Second Data Table cannot be null.");

            try
            {
                // Clone the first DataTable to avoid modifying the original
                var mergedDataTable = firstDataTable.Clone();

                // Handle columns based on the merge mode
                switch (mergeMode)
                {
                    case DataTableMergeModeEnum.AddExtraColumns:
                        AddExtraColumns(firstDataTable, secondDataTable, mergedDataTable);
                        break;

                    case DataTableMergeModeEnum.IgnoreExtraColumns:
                        IgnoreExtraColumns(firstDataTable, secondDataTable, mergedDataTable);
                        break;

                    case DataTableMergeModeEnum.ErrorOnExtraColumns:
                        ErrorOnExtraColumns(firstDataTable, secondDataTable);
                        break;

                    default:
                        throw new ArgumentException($"Unsupported merge mode: {mergeMode}");
                }

                // Copy rows from the second DataTable
                foreach (DataRow row in secondDataTable.Rows) mergedDataTable.ImportRow(row);

                // Set outputs
                context.SetValue(MergedDataTable, mergedDataTable);
                context.SetValue(StatusMessage, "Successfully merged the data tables.");
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to merge data tables: {ex.Message}", ex);
            }
        }

        private static void AddExtraColumns(DataTable firstDataTable, DataTable secondDataTable,
            DataTable mergedDataTable)
        {
            // Add columns from the second table that are not in the first table
            foreach (DataColumn column in secondDataTable.Columns)
                if (!firstDataTable.Columns.Contains(column.ColumnName))
                    mergedDataTable.Columns.Add(column.ColumnName, column.DataType);
        }

        private static void IgnoreExtraColumns(DataTable firstDataTable, DataTable secondDataTable,
            DataTable mergedDataTable)
        {
            // Only copy rows where columns match
            foreach (DataRow row in secondDataTable.Rows)
            {
                var newRow = mergedDataTable.NewRow();
                foreach (DataColumn column in firstDataTable.Columns)
                    if (secondDataTable.Columns.Contains(column.ColumnName))
                        newRow[column.ColumnName] = row[column.ColumnName];

                mergedDataTable.Rows.Add(newRow);
            }
        }

        private static void ErrorOnExtraColumns(DataTable firstDataTable, DataTable secondDataTable)
        {
            // Check for extra columns in the second table
            foreach (DataColumn column in secondDataTable.Columns)
                if (!firstDataTable.Columns.Contains(column.ColumnName))
                    throw new InvalidOperationException(
                        $"Column '{column.ColumnName}' in the second table does not exist in the first table.");
        }

        public enum DataTableMergeModeEnum
        {
            [Display(Name = "Add Extra Columns", Description = "Adds columns from the second table that are not present in the first table.")]
            AddExtraColumns = 0,

            [Display(Name = "Ignore Extra Columns", Description = "Ignores columns from the second table that are not present in the first table.")]
            IgnoreExtraColumns = 1,

            [Display(Name = "Error On Extra Columns", Description = "Throws an error if the second table has columns not present in the first table.")]
            ErrorOnExtraColumns = 2
        }
    }
}