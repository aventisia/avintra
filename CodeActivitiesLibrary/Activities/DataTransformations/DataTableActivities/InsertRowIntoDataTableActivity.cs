using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Insert Row Into Data Table")]
    [Description("Inserts a row at the end or before a specific index value.")]
    public sealed class InsertRowIntoDataTableActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Data Table")]
        [Description("The data table to which the row will be inserted.")]
        public InArgument<DataTable> DataTable { get; set; }

        [RequiredArgument]
        [DisplayName("Row Values")]
        [Description("An array of values to insert into the row.")]
        public InArgument<object[]> RowValues { get; set; }


        [DisplayName("Insert Location")]
        [Description("Specifies where to insert the new row.")]
        [DefaultValue(DataTableInsertRowLocationEnum.BeforeRowIndex)]
        public InArgument<DataTableInsertRowLocationEnum> InsertLocation { get; set; }


        [DisplayName("Row Index")]
        [Description(
            "The zero-based index before which to insert the row (required if 'Insert Location' is 'Before Row Index').")]
        [RenderIfCondition(nameof(InsertLocation), DataTableInsertRowLocationEnum.BeforeRowIndex)]
        public InArgument<int> RowIndex { get; set; }

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
                var rowValues = RowValues.Get(context);
                var insertLocation = InsertLocation.Get(context);

                if (dataTable == null)
                    throw new ArgumentException("Data table cannot be null.");

                if (rowValues == null)
                    throw new ArgumentException("Row values cannot be null.");

                if (rowValues.Length != dataTable.Columns.Count)
                    throw new ArgumentException(
                        $"Number of row values ({rowValues.Length}) does not match the number of columns in the data table ({dataTable.Columns.Count}).");

                switch (insertLocation)
                {
                    case DataTableInsertRowLocationEnum.BeforeRowIndex:
                        {
                            var rowIndex = RowIndex.Get(context);

                            if (rowIndex < 0 || rowIndex > dataTable.Rows.Count)
                                throw new ArgumentOutOfRangeException(nameof(RowIndex),
                                    $"Row index must be between 0 and {dataTable.Rows.Count}.");

                            var newRow = dataTable.NewRow();
                            for (var i = 0; i < rowValues.Length; i++)
                            {
                                newRow[i] = rowValues[i];
                            }

                            dataTable.Rows.InsertAt(newRow, rowIndex);
                            break;
                        }

                    case DataTableInsertRowLocationEnum.EndOfDataTable:
                        {
                            var newRow = dataTable.NewRow();
                            for (var i = 0; i < rowValues.Length; i++)
                            {
                                newRow[i] = rowValues[i];
                            }

                            dataTable.Rows.Add(newRow);
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(insertLocation));
                }

                status = $"Successfully inserted row into the data table.";
            }
            catch (Exception ex)
            {
                status = $"Error inserting row: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}