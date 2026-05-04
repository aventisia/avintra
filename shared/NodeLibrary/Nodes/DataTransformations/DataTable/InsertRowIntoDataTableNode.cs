using System.Data;
using NodeLibrary.DataTableNodes.Enums;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Insert Row Into Data Table"), Description("Inserts a new row into the data table at the specified location.")]
[NodeMetadata(icon: "/assets/DataTable.svg")]
public sealed class InsertRowIntoDataTableNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to which the new row will be added.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Row Values"), Description("An array of values to insert into the new row. Must match column count and types. Example: For columns [Id, Name, Age], use [1, 'John', 30]")]
    public required InArgument<object[]> RowValues { get; set; }

    [DisplayName("Insert Location"), Description("Specifies whether to insert the row at the end or before a specific index.")]
    public InArgument<DataTableInsertRowLocationEnum> InsertLocation { get; set; } = new InArgument<DataTableInsertRowLocationEnum>(DataTableInsertRowLocationEnum.EndOfDataTable);

    [DisplayName("Row Index"), Description("Zero-based index before which to insert the row (used only when location is 'Before Row Index').")]
    [RenderIfCondition(nameof(InsertLocation), DataTableInsertRowLocationEnum.BeforeRowIndex)]
    public InArgument<int> RowIndex { get; set; }

    [DisplayName("Modified Data Table"), Description("The updated data table with the new row inserted.")]
    public OutArgument<DataTable> ModifiedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

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
                        if (columnType == typeof(string))
                            newRow[i] = inputValue.ToString();
                        else if (columnType == typeof(int))
                            newRow[i] = Convert.ToInt32(inputValue);
                        else if (columnType == typeof(double))
                            newRow[i] = Convert.ToDouble(inputValue);
                        else if (columnType == typeof(decimal))
                            newRow[i] = Convert.ToDecimal(inputValue);
                        else if (columnType == typeof(bool))
                            newRow[i] = Convert.ToBoolean(inputValue);
                        else if (columnType == typeof(DateTime))
                            newRow[i] = Convert.ToDateTime(inputValue);
                        else
                            newRow[i] = Convert.ChangeType(inputValue, columnType);
                    }
                    catch (Exception ex)
                    {
                        throw new InvalidCastException(
                            $"Unable to convert value '{inputValue}' to type '{columnType.Name}' for column '{column.ColumnName}': {ex.Message}");
                    }
                }
            }

            if (insertLocation == DataTableInsertRowLocationEnum.EndOfDataTable)
            {
                dataTable.Rows.Add(newRow);
                status = "Successfully inserted row at the end of the data table.";
            }
            else if (insertLocation == DataTableInsertRowLocationEnum.BeforeRowIndex)
            {
                if (rowIndex < 0 || rowIndex > dataTable.Rows.Count)
                    throw new ArgumentOutOfRangeException(nameof(rowIndex),
                        $"Row index must be between 0 and {dataTable.Rows.Count}.");

                dataTable.Rows.InsertAt(newRow, rowIndex);
                status = $"Successfully inserted row at index {rowIndex}.";
            }

            ModifiedDataTable.Set(context, dataTable);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ModifiedDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error inserting row: {ex.Message}");
        }
    }
}
