using System.Runtime.InteropServices;

namespace NodeLibrary.Helpers;

public static class NodeLogHelper
{
    private static JsonSerializerOptions GetTruncatingSerializerOptions()
    {
        return new JsonSerializerOptions
        {
            WriteIndented = true,
            Converters = { new TruncatingJsonConverter() }
        };
    }

    private const int MAX_STRING_SIZE = 500; // Maximum characters for plain text strings
    private const string TRUNCATED_MARKER = "...[truncated]";

    public static string ConvertValueForLogging(string key, object value, string inOrOut, bool simpleOutputOnly)
    {
        if (value == null)
            return "null";

        // COM objects (e.g., Excel.Application, Excel.Workbook) cannot be safely serialized or
        // accessed from arbitrary threads. Logging them as a placeholder prevents RCW separation
        // errors during output collection.
        if (Marshal.IsComObject(value))
            return $"[COM Object: {value.GetType().Name}]";

        // Handle primitive type like int, bool, double, etc. return as is
        if (value.GetType().IsPrimitive)
            return value?.ToString() ?? "null";

        // Handle non-primitive types with specific formatting
        switch (value)
        {
            case string s:
                // Only truncate plain strings, not JSON
                return s.Length > MAX_STRING_SIZE ? s.Substring(0, MAX_STRING_SIZE) + TRUNCATED_MARKER : s;
            case DateTime date:
                return date.ToString("o"); // ISO 8601 format
            case TimeSpan _:
            case Guid _:
            case decimal _:
            case Enum _:
                return value?.ToString() ?? "null";
        }

        // If any known complex type, return a placeholder string (to avoid logging too much data or sensitive info)
        switch (value)
        {
            case FlaUI.Core.AutomationElements.AutomationElement _:
                return $"[AutomationElement] {key}";
            case Microsoft.Data.SqlClient.SqlConnection _:
                return $"[SqlConnection] {key}";
            case System.Security.SecureString _:
                return $"[Secure{inOrOut}] {key}";
                // Add more complex types here if needed
        }

        // For simple output only, return type name with truncation for long text
        if (simpleOutputOnly)
        {
            var simpleOutput = value?.ToString() ?? "null";
            return simpleOutput.Length > MAX_STRING_SIZE ? simpleOutput.Substring(0, MAX_STRING_SIZE) + TRUNCATED_MARKER : simpleOutput;
        }

        // Handle DataTable as json with top 100 rows to avoid logging too much data
        if (value is DataTable dt)
        {
            try
            {
                var rows = new List<Dictionary<string, object?>>();
                var rowCount = 0;
                foreach (DataRow row in dt.Rows.Cast<DataRow>())
                {
                    if (rowCount++ >= 100)
                        break;

                    var dict = new Dictionary<string, object?>();
                    foreach (DataColumn column in dt.Columns)
                    {
                        var cellValue = row[column];
                        dict[column.ColumnName] = cellValue is DBNull ? null : cellValue;
                    }
                    rows.Add(dict);
                }

                var summary = new
                {
                    Columns = dt.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToList(),
                    RowCount = dt.Rows.Count,
                    Rows = rows,
                };

                return JsonSerializer.Serialize(summary, GetTruncatingSerializerOptions());
            }
            catch
            {
                return $"[DataTable with {dt.Rows.Count} rows]";
            }
        }

        // Handle ConditionObjectGroup list with custom formatting
        if (value is List<List<ResolvedConditionModel>> conditions)
        {
            var groupsObject = new Dictionary<string, object>();
            int groupIndex = 1;
            foreach (var group in conditions)
            {
                var conditionsList = new List<string>();
                foreach (var cond in group)
                {
                    var firstValueFormatted = cond.FirstValue is string s ? (s.Length > MAX_STRING_SIZE ? s.Substring(0, MAX_STRING_SIZE) + TRUNCATED_MARKER : s) : cond.FirstValue?.ToString() ?? "null";
                    var secondValueFormatted = cond.SecondValue is string s2 ? (s2.Length > MAX_STRING_SIZE ? s2.Substring(0, MAX_STRING_SIZE) + TRUNCATED_MARKER : s2) : cond.SecondValue?.ToString() ?? "null";
                    conditionsList.Add($"{firstValueFormatted} {cond.ComparisonOperator} {secondValueFormatted}");
                }
                groupsObject[$"Group {groupIndex++}"] = conditionsList;
            }
            return JsonSerializer.Serialize(new[] { groupsObject }, GetTruncatingSerializerOptions());
        }

        // Handle JSON types - return complete valid JSON without truncation, as they are already structured data and truncation could break the format
        if (value is JsonElement || value is JsonDocument || value is System.Text.Json.Nodes.JsonNode)
        {
            try
            {
                switch (value)
                {
                    case JsonElement je:
                        return je.GetRawText();
                    case JsonDocument jd:
                        return jd.RootElement.GetRawText();
                    case System.Text.Json.Nodes.JsonNode jn:
                        return jn.ToJsonString();
                    default:
                        return $"[JsonType: {value.GetType().Name}]";
                }
            }
            catch
            {
                return $"[JsonType: {value.GetType().Name}]";
            }
        }

        // Handle IEnumerable - limit to 100 items but return complete valid JSON with truncated field values
        if (value is IEnumerable enumerable && !(value is string))
        {
            try
            {
                // Limit collection to 100 items and truncate large field values
                var limitedItems = enumerable.Cast<object>().Take(100).ToList();
                return JsonSerializer.Serialize(limitedItems, GetTruncatingSerializerOptions());
            }
            catch
            {
                // fallback: join items as string (limited to 100)
                var items = new List<string>();
                var count = 0;
                foreach (var item in enumerable)
                {
                    if (count++ >= 100) break;
                    items.Add(item?.ToString() ?? "null");
                }
                return "[" + string.Join(", ", items) + (count > 100 ? ", ...]" : "]");
            }
        }

        // Complex object: try JSON - return complete valid JSON with truncated field values
        try
        {
            return JsonSerializer.Serialize(value, GetTruncatingSerializerOptions());
        }
        catch
        {
            // fallback: type name with truncation for long text
            var fallback = value?.ToString() ?? "null";
            return fallback.Length > MAX_STRING_SIZE ? fallback.Substring(0, MAX_STRING_SIZE) + TRUNCATED_MARKER : fallback;
        }
    }
}