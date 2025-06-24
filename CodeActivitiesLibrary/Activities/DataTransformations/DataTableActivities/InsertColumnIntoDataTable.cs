using CodeActivitiesLibrary.DataTransformations.DataTableActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Insert Column Into Data Table")]
    [Description("Inserts a column at the end or before a specific index value.")]
    public sealed class InsertColumnIntoDataTable : BaseCodeActivity
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
        [Description("The zero-based index at which to insert the column (used if 'Insert Location' is 'Before Column Index').")]
        [RenderIfCondition(nameof(InsertLocation), DataTableInsertLocationEnum.BeforeColumnIndex)]
        public InArgument<int> ColumnIndex { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
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

                if (dataTable.Columns.Contains(columnName))
                    throw new ArgumentException($"A column named '{columnName}' already exists in the data table.");

                if (dataType == null || !typeof(ValueType).IsAssignableFrom(dataType) && dataType != typeof(string))
                    throw new ArgumentException("Invalid data type specified.");

                DataColumn newColumn = new DataColumn(columnName, dataType);

                switch (insertLocation)
                {
                    case DataTableInsertLocationEnum.BeforeColumnIndex:
                        {
                            var columnIndex = ColumnIndex.Get(context);

                            if (columnIndex < 0 || columnIndex > dataTable.Columns.Count)
                                throw new ArgumentOutOfRangeException(nameof(ColumnIndex),
                                    $"Column index must be between 0 and {dataTable.Columns.Count}.");

                            dataTable.Columns.Add(newColumn);
                            newColumn.SetOrdinal(columnIndex);
                            break;
                        }

                    case DataTableInsertLocationEnum.EndOfDataTable:
                        {
                            dataTable.Columns.Add(newColumn);
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(insertLocation));
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully inserted column '{columnName}' into the data table.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error inserting column: {ex.Message}");
            }
        }
    }
}