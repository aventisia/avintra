using System.Data;
using NodeLibrary.DataTableNodes.Enums;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Change Column Data Type"), Description("Casts one or more columns of a data table to a target data type.")]
[NodeMetadata(icon: "/assets/DataTable.svg", badge: "Beta")]
public class ChangeColumnDataTypeNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table whose columns will be converted.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Columns"), Description("Comma-separated column names to convert.")]
    public required InArgument<string> Columns { get; set; }

    [DisplayName("Target Data Type"), Description("The data type to convert the selected columns to.")]
    public required InArgument<DataTypeConversionEnum> TargetDataType { get; set; } = new InArgument<DataTypeConversionEnum>(DataTypeConversionEnum.String);

    [DisplayName("Converted Data Table"), Description("The data table with the converted column types.")]
    public OutArgument<DataTable> ConvertedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var columns = Columns.Get(context);
            var targetDataType = TargetDataType.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(columns))
                throw new ArgumentException("Columns cannot be empty.");

            var columnNames = columns
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToList();

            var targetType = GetTargetType(targetDataType);
            var resultTable = dataTable.Clone();
            foreach (var col in columnNames)
            {
                if (!resultTable.Columns.Contains(col))
                    throw new ArgumentException($"Column '{col}' does not exist in the data table.");
                resultTable.Columns[col]!.DataType = targetType;
            }

            foreach (DataRow row in dataTable.Rows)
            {
                var newRow = resultTable.NewRow();
                foreach (DataColumn column in resultTable.Columns)
                {
                    var value = row[column.ColumnName];
                    newRow[column.ColumnName] = value == null || value == DBNull.Value
                        ? DBNull.Value
                        : ConvertValue(value, targetType);
                }
                resultTable.Rows.Add(newRow);
            }

            ConvertedDataTable.Set(context, resultTable);
            status = $"Successfully converted {columnNames.Count} columns to {targetDataType}.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ConvertedDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error converting column data type: {ex.Message}");
        }
    }

    private static Type GetTargetType(DataTypeConversionEnum type)
    {
        return type switch
        {
            DataTypeConversionEnum.String => typeof(string),
            DataTypeConversionEnum.Int32 => typeof(int),
            DataTypeConversionEnum.Int64 => typeof(long),
            DataTypeConversionEnum.Decimal => typeof(decimal),
            DataTypeConversionEnum.Double => typeof(double),
            DataTypeConversionEnum.DateTime => typeof(DateTime),
            DataTypeConversionEnum.Boolean => typeof(bool),
            DataTypeConversionEnum.Guid => typeof(Guid),
            _ => typeof(string)
        };
    }

    private static object ConvertValue(object value, Type targetType)
    {
        if (targetType == typeof(string))
            return value.ToString() ?? "";
        if (targetType == typeof(bool))
        {
            if (value is bool b) return b;
            var text = value.ToString();
            if (bool.TryParse(text, out var parsed)) return parsed;
            if (text is "1" or "yes" or "true" or "TRUE") return true;
            return false;
        }
        return Convert.ChangeType(value, targetType, CultureInfo.InvariantCulture);
    }
}
