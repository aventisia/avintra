using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Insert Column Into Data Table")]
    [Description("Inserts a column at the end or before a specific index value.")]
    public sealed class InsertColumnIntoDataTable : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Data Table")]
        [Description("The data table to modify.")]
        public InArgument<DataTable> DataTable { get; set; }

        [RequiredArgument]
        [DisplayName("Column Name")]
        [Description("The name of the new column.")]
        public InArgument<string> ColumnName { get; set; }

        [RequiredArgument]
        [DisplayName("Data Type")]
        [Description("The data type of the new column.")]
        public InArgument<Type> DataType { get; set; }


        [DisplayName("Insert Location")]
        [Description("Specifies where to insert the new column.")]
        [DefaultValue(DataTableInsertLocationEnum.BeforeColumnIndex)]
        public InArgument<DataTableInsertLocationEnum> InsertLocation { get; set; }


        [DisplayName("Column Index")]
        [Description(
            "The zero-based index at which to insert the column (required if 'Insert Location' is 'Before Column Index').")]
        [RenderIfCondition(nameof(InsertLocation), "BeforeColumnIndex")]
        public InArgument<int> ColumnIndex { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var dataTable = DataTable.Get(context);
                var columnName = ColumnName.Get(context);
                var dataType = DataType.Get(context);
                var insertLocation = InsertLocation.Get(context);

                if (dataTable == null)
                    throw new ArgumentException("Data table cannot be null.");

                if (string.IsNullOrWhiteSpace(columnName))
                    throw new ArgumentException("Column name cannot be empty.");

                if (!typeof(DataTable).IsAssignableFrom(dataType))
                    throw new ArgumentException("Invalid data type specified.");

                switch (insertLocation)
                {
                    case DataTableInsertLocationEnum.BeforeColumnIndex:
                        {
                            var columnIndex = ColumnIndex.Get(context);

                            if (columnIndex < 0 || columnIndex > dataTable.Columns.Count)
                                throw new ArgumentOutOfRangeException(nameof(ColumnIndex),
                                    $"Column index must be between 0 and {dataTable.Columns.Count}.");

                            dataTable.Columns.Add(new DataColumn(columnName, dataType));
                            dataTable.Columns[columnName].SetOrdinal(columnIndex);
                            break;
                        }

                    case DataTableInsertLocationEnum.EndOfDataTable:
                        {
                            dataTable.Columns.Add(new DataColumn(columnName, dataType));
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(insertLocation));
                }

                status = $"Successfully inserted column '{columnName}' into the data table.";
            }
            catch (Exception ex)
            {
                status = $"Error inserting column: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}