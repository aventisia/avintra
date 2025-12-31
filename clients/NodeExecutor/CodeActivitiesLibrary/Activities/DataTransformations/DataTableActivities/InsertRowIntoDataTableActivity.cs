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
    [ActivityMetaData(nodeImg: "/assets/DataTable.svg")]
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
        [Description("An array of values to insert into the new row. Must match column count and types." +
                     "Example: For columns [Id, Name, Age], use [1, 'John', 30]")]
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
                var rowIndex = RowIndex.Get(context);

                if (dataTable == null)
                    throw new ArgumentNullException("DataTable", "DataTable cannot be null.");

                if (rowValues == null || rowValues.Length == 0)
                    throw new ArgumentException("RowValues cannot be null or empty.", nameof(RowValues));

                if (rowValues.Length != dataTable.Columns.Count)
                    throw new InvalidOperationException(
                        $"The number of values provided ({rowValues.Length}) does not match the number of columns in the data table ({dataTable.Columns.Count}).");

                var newRow = dataTable.NewRow();

                for (int i = 0; i < rowValues.Length; i++)
                {
                    var column = dataTable.Columns[i];
                    var columnType = column.DataType;
                    var inputValue = rowValues[i];

                    if (inputValue == null || Equals(inputValue, DBNull.Value))
                    {
                        newRow[i] = DBNull.Value;
                    }
                    else
                    {
                        try
                        {
                            newRow[i] = Convert.ChangeType(inputValue, columnType);
                        }
                        catch (Exception ex)
                        {
                            throw new InvalidCastException($"Value '{inputValue}' cannot be converted to {columnType.Name} for column '{column.ColumnName}'.", ex);
                        }
                    }
                }

                switch (insertLocation)
                {
                    case DataTableInsertRowLocationEnum.BeforeRowIndex:
                        if (rowIndex < 0 || rowIndex > dataTable.Rows.Count)
                            throw new ArgumentOutOfRangeException(nameof(RowIndex), "RowIndex must be within the range of the data table.");
                        dataTable.Rows.InsertAt(newRow, rowIndex);
                        break;

                    case DataTableInsertRowLocationEnum.EndOfDataTable:
                        dataTable.Rows.Add(newRow);
                        break;

                    default:
                        throw new InvalidOperationException("Invalid insertion location.");
                }

                ModifiedDataTable.Set(context, dataTable);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully inserted row at location '{insertLocation}'.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error inserting row: {ex.Message}");
            }
        }
    }
}