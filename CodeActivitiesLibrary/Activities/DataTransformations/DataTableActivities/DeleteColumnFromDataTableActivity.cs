using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Delete Column From Data Table")]
    [Description("Deletes a data table column at the specified column index or column name.")]
    public sealed class DeleteColumnFromDataTableActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------


        [DisplayName("Data Table")]
        [Description("The data table to modify.")]
        public InArgument<DataTable> DataTable { get; set; }


        [DisplayName("Specify Column With")]
        [Description("Specifies whether to delete the column by name or index.")]
        [DefaultValue(DataTableDeleteColumnByEnum.Name)]
        public InArgument<DataTableDeleteColumnByEnum> SpecifyColumnWith { get; set; }


        [DisplayName("Column Name")]
        [Description("The name of the column to delete (required if 'Specify Column With' is 'Name').")]
        [RenderIfCondition(nameof(SpecifyColumnWith), "Name")]
        public InArgument<string> ColumnName { get; set; }


        [DisplayName("Column Index")]
        [Description("The zero-based index of the column to delete (required if 'Specify Column With' is 'Index').")]
        [RenderIfCondition(nameof(SpecifyColumnWith), "Index")]
        public InArgument<int> ColumnIndex { get; set; }

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
                var specifyColumnWith = SpecifyColumnWith.Get(context);

                if (dataTable == null)
                    throw new ArgumentException("Data table cannot be null.");

                switch (specifyColumnWith)
                {
                    case DataTableDeleteColumnByEnum.Name:
                        {
                            var columnName = ColumnName.Get(context);

                            if (string.IsNullOrWhiteSpace(columnName))
                                throw new ArgumentException("Column name cannot be empty when using 'Name' mode.");

                            if (!dataTable.Columns.Contains(columnName))
                                throw new ArgumentException($"Column '{columnName}' not found in the data table.");

                            dataTable.Columns.Remove(columnName);
                            break;
                        }

                    case DataTableDeleteColumnByEnum.Index:
                        {
                            var columnIndex = ColumnIndex.Get(context);

                            if (columnIndex < 0 || columnIndex >= dataTable.Columns.Count)
                                throw new ArgumentException($"Invalid column index: {columnIndex}");

                            dataTable.Columns.RemoveAt(columnIndex);
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(specifyColumnWith));
                }
            }
            catch (Exception ex)
            {
                status = $"Error deleting column: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}