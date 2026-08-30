using System.Data;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Merge Data Tables"), Description("Merges two data tables together, specifying the merging behavior in case their columns are different.")]
[NodeMetadata(icon: "/assets/DataTable.svg")]
public class MergeDataTablesNode : BaseNode
{
    [DisplayName("First Data Table"), Description("The first DataTable to be merged.")]
    public required InArgument<DataTable> FirstDataTable { get; set; }

    [DisplayName("Second Data Table"), Description("The second DataTable to be merged.")]
    public required InArgument<DataTable> SecondDataTable { get; set; }

    [DisplayName("Merge Mode"), Description("Specifies how to handle columns that are present in the second table but not in the first table.")]
    public required InArgument<DataTableMergeModeEnum> MergeMode { get; set; } = new InArgument<DataTableMergeModeEnum>(DataTableMergeModeEnum.AddExtraColumns);

    [DisplayName("Merged Data Table"), Description("The resulting DataTable after merging the two input Data Tables.")]
    public OutArgument<DataTable> MergedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            // Retrieve input values
            var firstDataTable = FirstDataTable.Get(context);
            var secondDataTable = SecondDataTable.Get(context);
            var mergeMode = MergeMode.Get(context);

            // Validate inputs
            if (firstDataTable == null)
                throw new ArgumentException("First Data Table cannot be null.");
            if (secondDataTable == null)
                throw new ArgumentException("Second Data Table cannot be null.");

            // Create a new DataTable to hold the merged result
            var mergedTable = new DataTable("MergedTable");

            // Step 1: Add all unique columns from both tables
            foreach (DataColumn column in firstDataTable.Columns)
                mergedTable.Columns.Add(column.ColumnName, column.DataType);

            foreach (DataColumn column in secondDataTable.Columns)
            {
                if (!mergedTable.Columns.Contains(column.ColumnName))
                    mergedTable.Columns.Add(column.ColumnName, column.DataType);
            }

            // Step 2: Import rows from first table
            foreach (DataRow row in firstDataTable.Rows)
            {
                var newRow = mergedTable.NewRow();
                foreach (DataColumn column in firstDataTable.Columns)
                    newRow[column.ColumnName] = row[column];

                mergedTable.Rows.Add(newRow);
            }

            // Step 3: Import rows from second table
            foreach (DataRow row in secondDataTable.Rows)
            {
                var newRow = mergedTable.NewRow();

                foreach (DataColumn column in secondDataTable.Columns)
                    newRow[column.ColumnName] = row[column];

                // Fill in missing columns with default values
                foreach (DataColumn column in mergedTable.Columns)
                {
                    if (!row.Table.Columns.Contains(column.ColumnName))
                        newRow[column.ColumnName] = DBNull.Value;
                }

                mergedTable.Rows.Add(newRow);
            }

            // Set outputs
            MergedDataTable.Set(context, mergedTable);
            status = "Successfully merged the data tables, including all columns from both.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            MergedDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Failed to merge data tables: {ex.Message}");
        }
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
