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

        [DisplayName("Is Success")]
        [Description("Indicates whether the operation completed successfully.")]
        public OutArgument<bool> IsSuccess { get; set; }

        [DisplayName("Status Message")]
        [Description("Provides additional information about the result, including any error messages.")]
        public OutArgument<string> StatusMessage { get; set; }

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
                    throw new ArgumentException("Data table cannot be null.");

                if (rowValues == null)
                    throw new ArgumentException("Row values cannot be null.");

                if (rowValues.Length != dataTable.Columns.Count)
                    throw new ArgumentException(
                        $"Number of row values ({rowValues.Length}) does not match the number of columns ({dataTable.Columns.Count}).");

                // Clone the original table to prevent side-effects (optional but safe)
                var modifiedTable = dataTable.Copy();

                // Create a new row and assign values
                var newRow = modifiedTable.NewRow();
                for (int i = 0; i < rowValues.Length; i++)
                {
                    var value = rowValues[i];
                    var columnType = modifiedTable.Columns[i].DataType;

                    if (value == null || value is DBNull)
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
                            throw new InvalidCastException($"Value at index {i} cannot be cast to {columnType.Name}.", ex);
                        }
                    }
                }

                // Insert based on location
                switch (insertLocation)
                {
                    case DataTableInsertRowLocationEnum.BeforeRowIndex:
                        {
                            var rowIndex = RowIndex.Get(context);

                            if (rowIndex < 0 || rowIndex > modifiedTable.Rows.Count)
                                throw new ArgumentOutOfRangeException(nameof(rowIndex),
                                    $"Row index must be between 0 and {modifiedTable.Rows.Count}.");

                            modifiedTable.Rows.InsertAt(newRow, rowIndex);
                            break;
                        }

                    case DataTableInsertRowLocationEnum.EndOfDataTable:
                        modifiedTable.Rows.Add(newRow);
                        break;

                    default:
                        throw new InvalidOperationException("Invalid insert location.");
                }

                // Set outputs
                ModifiedDataTable.Set(context, modifiedTable);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully inserted row into the data table.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error inserting row: {ex.Message}");
                ModifiedDataTable.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error inserting row: {ex.Message}");
            }
        }
    }
}