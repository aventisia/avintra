using CodeActivitiesLibrary.DataTransformations.DataTableActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Insert Row Into Data Table")]
    [Description("Inserts a new row into the data table at the specified location.")]
    public sealed class InsertRowIntoDataTableActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Data Table")]
        [Description("The data table to which the new row will be added.")]
        public InArgument<DataTable> DataTable { get; set; }

        [RequiredArgument]
        [DisplayName("Row Values")]
        [Description("An array of values to insert into the new row. Must match column count and types.")]
        public InArgument<object[]> RowValues { get; set; }

        [DisplayName("Insert Location")]
        [Description("Specifies whether to insert the row at the end or before a specific index.")]
        [DefaultValue(DataTableInsertRowLocationEnum.EndOfDataTable)]
        public InArgument<DataTableInsertRowLocationEnum> InsertLocation { get; set; }

        [DisplayName("Row Index")]
        [Description("Zero-based index before which to insert the row (used only when location is 'Before Row Index').")]
        [RenderIfCondition(nameof(InsertLocation), DataTableInsertRowLocationEnum.BeforeRowIndex)]
        public InArgument<int> RowIndex { get; set; }

         // ----------------------
        // Output Arguments
        // ----------------------
        [DisplayName("Modified Data Table")]
        [Description("The updated data table with the new row inserted.")]
        public OutArgument<DataTable> ModifiedDataTable { get; set; }


        // ----------------------
        // Execution Logic
        // ----------------------

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var dataTable = DataTable.Get(context);
                var rowValues = RowValues.Get(context);
                var insertLocation = InsertLocation.Get(context);

                if (dataTable == null)
                    throw new ArgumentException("DataTable cannot be null.");

                if (rowValues == null)
                    throw new ArgumentException("RowValues cannot be null.");

                if (rowValues.Length != dataTable.Columns.Count)
                    throw new ArgumentException(
                        $"RowValues length ({rowValues.Length}) does not match the number of columns ({dataTable.Columns.Count}).");

                // create new DataRow
                var newRow = dataTable.NewRow();
                for (int i = 0; i < rowValues.Length; i++)
                {
                    var columnType = dataTable.Columns[i].DataType;

                    object value = rowValues[i];

                    if (value == null || value == DBNull.Value)
                    {
                        newRow[i] = DBNull.Value;
                    }
                    else if (columnType.IsInstanceOfType(value))
                    {
                        newRow[i] = value;
                    }
                    else
                    {
                        try
                        {
                            newRow[i] = Convert.ChangeType(value, columnType);
                        }
                        catch (Exception ex)
                        {
                            throw new InvalidCastException($"Value at index {i} cannot be converted to {columnType.Name}.", ex);
                        }
                    }
                }

                switch (insertLocation)
                {
                    case DataTableInsertRowLocationEnum.EndOfDataTable:
                        dataTable.Rows.Add(newRow);
                        break;

                    case DataTableInsertRowLocationEnum.BeforeRowIndex:
                        var rowIndex = RowIndex.Get(context);
                        if (rowIndex < 0 || rowIndex > dataTable.Rows.Count)
                            throw new ArgumentOutOfRangeException(nameof(rowIndex),
                                $"Row index must be between 0 and {dataTable.Rows.Count}.");
                        dataTable.Rows.InsertAt(newRow, rowIndex);
                        break;

                    default:
                        throw new InvalidOperationException("Unsupported insert location.");
                }

                // Set outputs
                ModifiedDataTable.Set(context, dataTable);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully inserted row at location {insertLocation}.");
            }
            catch (Exception ex)
            {
                ModifiedDataTable.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error inserting row: {ex.Message}");
            }
        }
    }
}