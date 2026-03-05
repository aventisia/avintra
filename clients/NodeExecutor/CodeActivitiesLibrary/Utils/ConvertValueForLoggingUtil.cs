using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using CodeActivitiesLibrary.Models;
using Newtonsoft.Json;

namespace CodeActivitiesLibrary.Utils
{
    public static class ConvertValueForLoggingUtil
    {
        public static string ConvertValueForLogging(string key, object value, string inOrOut, bool simpleOutputOnly)
        {
            const int MAX_STRING_SIZE = 2000; // Maximum characters for plain text strings

            if (value == null)
                return "null";

            // Handle primitive type like int, bool, double, etc. return as is
            if (value.GetType().IsPrimitive)
                return value.ToString();

            // Handle non-primitive types with specific formatting
            switch (value)
            {
                case string s:
                    // Only truncate plain strings, not JSON
                    return s.Length > MAX_STRING_SIZE ? s.Substring(0, MAX_STRING_SIZE) + "... [truncated]" : s;
                case DateTime date:
                    return date.ToString("o"); // ISO 8601 format
                case TimeSpan _:
                case Guid _:
                case decimal _:
                case Enum _:
                    return value.ToString();
            }

            // If any known complex type, return a placeholder string (to avoid logging too much data or sensitive info)
            switch (value)
            {
                case System.Windows.Automation.AutomationElement _:
                    return $"[AutomationElement] {key}";
                case System.Data.SqlClient.SqlConnection _:
                    return $"[SqlConnection] {key}";
                case System.Security.SecureString _:
                    return $"[Secure{inOrOut}] {key}";
                    // Add more complex types here if needed
            }

            // For simple output only, return type name with truncation for long text
            if (simpleOutputOnly)
            {
                var simpleOutput = value.ToString();
                return simpleOutput.Length > MAX_STRING_SIZE ? simpleOutput.Substring(0, MAX_STRING_SIZE) + "... [truncated]" : simpleOutput;
            }

            // Handle DataTable as json with top 100 rows to avoid logging too much data
            if (value is DataTable dt)
            {
                try
                {
                    // Limit to 100 rows but return complete valid JSON
                    var limitedRows = dt.AsEnumerable().Take(100).CopyToDataTable();
                    return JsonConvert.SerializeObject(limitedRows);
                }
                catch
                {
                    return $"[DataTable with {dt.Rows.Count} rows]";
                }
            }

            // Handle ConditionObjectGroup list with custom formatting
            if (value is List<List<ResolvedConditionObj>> conditions)
            {
                var groupsObject = new Dictionary<string, object>();
                int groupIndex = 1;
                foreach (var group in conditions)
                {
                    var conditionsList = new List<string>();
                    foreach (var cond in group)
                    {
                        var firstValueFormatted = cond.FirstValue is string s ? (s.Length > MAX_STRING_SIZE ? s.Substring(0, MAX_STRING_SIZE) + "... [truncated]" : s) : cond.FirstValue?.ToString();
                        var secondValueFormatted = cond.SecondValue is string s2 ? (s2.Length > MAX_STRING_SIZE ? s2.Substring(0, MAX_STRING_SIZE) + "... [truncated]" : s2) : cond.SecondValue?.ToString();
                        conditionsList.Add($"{firstValueFormatted} {cond.ComparisonOperator} {secondValueFormatted}");
                    }
                    groupsObject[$"Group {groupIndex++}"] = conditionsList;
                }
                return JsonConvert.SerializeObject(new[] { groupsObject }, Formatting.Indented);
            }

            // Handle IEnumerable - limit to 100 items but return complete valid JSON
            if (value is IEnumerable enumerable && !(value is string))
            {
                try
                {
                    // Limit collection to 100 items
                    var limitedItems = enumerable.Cast<object>().Take(100).ToList();
                    return JsonConvert.SerializeObject(limitedItems);
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

            // Complex object: try JSON - return complete valid JSON
            try
            {
                return JsonConvert.SerializeObject(value);
            }
            catch
            {
                // fallback: type name with truncation for long text
                var fallback = value.ToString();
                return fallback.Length > MAX_STRING_SIZE ? fallback.Substring(0, MAX_STRING_SIZE) + "... [truncated]" : fallback;
            }
        }
    }
}