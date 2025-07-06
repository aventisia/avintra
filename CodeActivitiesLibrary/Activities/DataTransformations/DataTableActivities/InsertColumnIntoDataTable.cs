using CodeActivitiesLibrary.DataTransformations.DataTableActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Insert Column Into Data Table")]
    [Description("Inserts a new column into the data table either at the end or before a specific column index.")]
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
        [Description("The data type of the new column (e.g., string, int).")]
        public InArgument<Type> DataType { get; set; }

        [DisplayName("Insert Location")]
        [Description("Specifies whether to insert the column at the end or before a specific column index.")]
        [DefaultValue(DataTableInsertLocationEnum.EndOfDataTable)]
        public InArgument<DataTableInsertLocationEnum> InsertLocation { get; set; }

        [DisplayName("Column Index")]
        [Description("Zero-based index where the column should be inserted (used only when location is 'Before Column Index').")]
        [RenderIfCondition(nameof(InsertLocation), DataTableInsertLocationEnum.BeforeColumnIndex)]
        public InArgument<int> ColumnIndex { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------
        [DisplayName("Modified Data Table")]
        [Description("The updated data table with the new column inserted.")]
        public OutArgument<DataTable> ModifiedDataTable { get; set; }

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

                // Create new DataColumn
                var newColumn = new DataColumn(columnName, dataType);

                switch (insertLocation)
                {
                    case DataTableInsertLocationEnum.EndOfDataTable:
                        dataTable.Columns.Add(newColumn);
                        break;

                    case DataTableInsertLocationEnum.BeforeColumnIndex:
                        {
                            int columnIndex = ColumnIndex.Get(context);

                            if (columnIndex < 0 || columnIndex > dataTable.Columns.Count)
                                throw new ArgumentOutOfRangeException(nameof(columnIndex),
                                    $"Column index must be between 0 and {dataTable.Columns.Count - 1}.");

                            // Add and set ordinal
                            dataTable.Columns.Add(newColumn);
                            newColumn.SetOrdinal(columnIndex);
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException();
                }

                // Set outputs
                ModifiedDataTable.Set(context, dataTable);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully inserted column '{columnName}'.");
            }
            catch (Exception ex)
            {
                // Log error and return failure
                Console.WriteLine($"Error inserting column: {ex.Message}");
                ModifiedDataTable.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error inserting column: {ex.Message}");
            }
        }
    }
}