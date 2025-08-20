namespace AspNetToolkit.Utils;

// A utility class to export a collection of objects to a CSV byte array.
public static class CsvDataExporterUtil
{
    // Exports a collection of data to CSV format as a UTF-8 byte array.
    public static byte[] ExportToCsvBytes<T>(IEnumerable<T> data)
    {
        // Get all public instance properties of type T
        var properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);

        // Pre-compile property getters for performance
        var getters = properties
            .Select(p =>
            {
                var param = Expression.Parameter(typeof(T), "x");
                var body = Expression.Convert(Expression.Property(param, p), typeof(object));
                return Expression.Lambda<Func<T, object>>(body, param).Compile();
            })
            .ToArray();

        var sb = new StringBuilder();

        // Write CSV header
        sb.AppendLine(string.Join(",", properties.Select(p => p.Name)));

        // Write CSV rows
        foreach (var item in data)
        {
            var values = new string[getters.Length];

            for (int i = 0; i < getters.Length; i++)
            {
                var val = getters[i](item);

                if (val == null)
                {
                    values[i] = "";
                    continue;
                }

                var str = val!.ToString()!;

                // Escape if needed
                if (str.Contains(',') || str.Contains('"') || str.Contains('\n'))
                {
                    str = $"\"{str.Replace("\"", "\"\"")}\"";
                }

                values[i] = str;
            }

            sb.AppendLine(string.Join(",", values));
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }
}