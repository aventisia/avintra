namespace NodeLibrary.Helpers;

public static class NodeLogHelper
{
    public static Func<string, object, string, string?>? PlatformSpecificConvertValueForLogging { get; set; }

    public static string ConvertValueForLogging(string key, object? value, string inOrOut)
    {
        if (value is null)
            return "null";

        var converted = PlatformSpecificConvertValueForLogging?.Invoke(key, value, inOrOut);
        if (converted is not null)
            return converted;

        var valueType = value.GetType();

        if (valueType.IsGenericType && valueType.GetGenericTypeDefinition() == typeof(InArgument<>))
        {
            var innerValue = valueType.GetProperty("Value")?.GetValue(value);
            return ConvertValueForLogging(key, innerValue, inOrOut);
        }

        if (valueType.IsGenericType && valueType.GetGenericTypeDefinition() == typeof(OutArgument<>))
        {
            var innerValue = valueType.GetProperty("Value")?.GetValue(value);
            return ConvertValueForLogging(key, innerValue, inOrOut);
        }

        if (value is System.Data.DataTable dataTable)
        {
            var preview = string.Join(", ", dataTable.Columns.Cast<System.Data.DataColumn>().Select(c => c.ColumnName));
            return $"DataTable with columns [{preview}]";
        }

        if (value is System.Data.DataSet dataSet)
        {
            var tableNames = string.Join(", ", dataSet.Tables.Cast<System.Data.DataTable>().Select(t => t.TableName));
            return $"DataSet with tables [{tableNames}]";
        }

        if (value is byte[] bytes)
        {
            var preview = bytes.Length > 32
                ? Convert.ToHexString(bytes.AsSpan(0, 32)) + "..."
                : Convert.ToHexString(bytes);
            return $"byte[{bytes.Length}] 0x{preview}";
        }

        var stringValue = value.ToString() ?? "";
        return stringValue.Length > 255 ? stringValue[..255] + "..." : stringValue;
    }
}
