using CodeActivitiesLibrary.DataTransformations.DataTableActivities.Enums;
using CodeActivitiesLibrary.DataTransformations.VariablesActivities;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Sort Data Table")]
    [Description(
        "Sorts the data table rows in ascending or descending order by the specified column, provided that all its values have the same data type.")]
    public class SortDataTableActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Data Table")]
        [Description("The DataTable containing the data to be sorted.")]
        public InArgument<DataTable> DataTable { get; set; }

        [RequiredArgument]
        [DisplayName("Specify Column With")]
        [Description("Choose whether to specify the column by name or index.")]
        [DefaultValue(DataTableSortColumnByEnum.Name)]
        public InArgument<DataTableSortColumnByEnum> SpecifyColumnWith { get; set; } =
            new InArgument<DataTableSortColumnByEnum>(DataTableSortColumnByEnum.Name);


        [DisplayName("Column Name")]
        [Description("The name of the column to sort by (used when 'Specify Column With' is set to 'Name').")]
        [RenderIfCondition(nameof(SpecifyColumnWith), DataTableSortColumnByEnum.Name)]
        public InArgument<string> ColumnName { get; set; }

        [DisplayName("Column Index")]
        [Description("The index of the column to sort by (used when 'Specify Column With' is set to 'Index').")]
        [RenderIfCondition(nameof(SpecifyColumnWith), DataTableSortColumnByEnum.Index)]
        public InArgument<int> ColumnIndex { get; set; }

        [RequiredArgument]
        [DisplayName("Order")]
        [Description("Specifies whether to sort in ascending or descending order.")]
        [DefaultValue(SortOrderEnum.Ascending)]
        public InArgument<SortOrderEnum> Order { get; set; } =
            new InArgument<SortOrderEnum>(SortOrderEnum.Ascending);

        [DisplayName("Sorted Data Table")]
        [Description("The DataTable after it has been sorted based on the specified criteria.")]
        public OutArgument<DataTable> SortedDataTable { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            // Retrieve input values
            var dataTable = context.GetValue(DataTable);
            var specifyColumnWith = context.GetValue(SpecifyColumnWith);
            var columnName = context.GetValue(ColumnName);
            var columnIndex = context.GetValue(ColumnIndex);
            var sortOrder = context.GetValue(Order);

            // Validate inputs
            if (dataTable == null) throw new ArgumentException("Data table cannot be null.");

            string sortColumnName = null;

            switch (specifyColumnWith)
            {
                case DataTableSortColumnByEnum.Name:
                    if (string.IsNullOrWhiteSpace(columnName))
                        throw new ArgumentException("Column name cannot be null or empty.");

                    if (!dataTable.Columns.Contains(columnName))
                        throw new ArgumentException($"Column '{columnName}' does not exist in the data table.");

                    sortColumnName = columnName;
                    break;

                case DataTableSortColumnByEnum.Index:
                    if (columnIndex < 0 || columnIndex >= dataTable.Columns.Count)
                        throw new IndexOutOfRangeException($"Column index {columnIndex} is out of range.");

                    sortColumnName = dataTable.Columns[columnIndex].ColumnName;
                    break;

                default:
                    throw new ArgumentException($"Unsupported column specification mode: {specifyColumnWith}");
            }

            try
            {
                // Clone the original DataTable to avoid modifying the input
                var sortedDataTable = dataTable.Clone();

                // Sort the DataTable using LINQ
                var sortedRows = dataTable.AsEnumerable()
                    .OrderBy(row => row[sortColumnName])
                    .Select(row => row.ItemArray)
                    .ToArray();

                if (sortOrder == SortOrderEnum.Descending) sortedRows = sortedRows.Reverse().ToArray();

                // Add sorted rows to the cloned DataTable
                foreach (var rowArray in sortedRows) sortedDataTable.LoadDataRow(rowArray, true);

                // Set outputs
                SortedDataTable.Set(context, sortedDataTable);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully sorted the data table by column '{sortColumnName}'.");
            }
            catch (Exception ex)
            {
                SortedDataTable.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to sort the data table: {ex.Message}");
            }
        }
    }
}