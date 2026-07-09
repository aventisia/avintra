namespace AspNetToolkit.Utils;

/// <summary>
/// A utility class for exporting data to CSV format.
/// </summary>
public static class CsvDataExporterUtil
{
    /// <summary>
    /// Exports a collection of data to a CSV formatted byte array, encoded in UTF-8.
    /// </summary>
    /// <typeparam name="T">The type of the data objects in the collection.</typeparam>
    /// <param name="data">The collection of objects to export.</param>
    /// <param name="headers">An optional list of column headers. If null, the property's DisplayAttribute or property names will be used as headers.</param>
    /// <returns>A byte array containing the CSV data.</returns>
    public static byte[] ExportToCsvBytes<T>(IEnumerable<T> data, List<string>? headers = null)
    {
        var sb = new StringBuilder();
        // Get all public instance properties of type T
        var allProperties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);

        // If headers not provided, generate it from the property's DisplayAttribute or fallback to property names
        if (headers == null || !headers.Any())
        {
            headers = allProperties.Select(p => p.GetCustomAttribute<DisplayAttribute>()?.Name ?? p.Name).ToList();
        }

        // Create an ordered array of getters
        var getters = allProperties
            .Select(p =>
            {
                var param = Expression.Parameter(typeof(T), "x");
                var body = Expression.Convert(Expression.Property(param, p), typeof(object));
                return Expression.Lambda<Func<T, object>>(body, param).Compile();
            })
            .ToArray();
        
        // Write the CSV header row
        sb.AppendLine(string.Join(",", headers.Select(EscapeCsvField)));

        // Write the CSV data rows
        foreach (var item in data)
        {
            var values = new string[getters.Length];
            // Use a 'for' loop to get values by index for performance
            for (int i = 0; i < getters.Length; i++)
            {
                var val = getters[i](item);
                values[i] = EscapeCsvField(val?.ToString() ?? "");
            }
            sb.AppendLine(string.Join(",", values));
        }
        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    public static MemoryStream ExportToCsvMemoryStream<T>(IEnumerable<T> data, List<string>? headers = null)
    {
        var csvBytes = ExportToCsvBytes(data, headers);
        return new MemoryStream(csvBytes);
    }

    /// <summary>
    /// Escapes a string field according to CSV rules.
    /// </summary>
    private static string EscapeCsvField(string field)
    {
        if (string.IsNullOrEmpty(field))
        {
            return "";
        }

        // If the field contains a comma, double-quote, or newline, it must be escaped.
        if (field.Contains(',') || field.Contains('"') || field.Contains('\n'))
        {
            // Enclose the entire field in double quotes and escape any internal double quotes
            // by doubling them (e.g., " becomes "").
            return $"\"{field.Replace("\"", "\"\"")}\"";
        }

        return field;
    }
}