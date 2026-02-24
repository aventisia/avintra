namespace AspNetToolkit.Utils;

public static class CloudConnectionPayloadUtil
{
    /// <summary>
    /// Safely retrieves a string value from the payload dictionary.
    /// Returns empty string if the key doesn't exist or value is null.
    /// </summary>
    public static string GetValue(Dictionary<string, object> payload, string key)
    {
        if (payload == null) return string.Empty;
        return payload.ContainsKey(key) ? payload[key]?.ToString()?.Trim() ?? string.Empty : string.Empty;
    }

    /// <summary>
    /// Safely retrieves a boolean value from the payload dictionary.
    /// Returns the default value if the key doesn't exist or parsing fails.
    /// </summary>
    public static bool GetBool(Dictionary<string, object> payload, string key, bool defaultValue = false)
    {
        if (payload == null) return defaultValue;
        return payload.ContainsKey(key) && bool.TryParse(payload[key]?.ToString(), out var b) ? b : defaultValue;
    }

    /// <summary>
    /// Safely retrieves an integer value from the payload dictionary.
    /// Returns the default value if the key doesn't exist or parsing fails.
    /// </summary>
    public static int GetInt(Dictionary<string, object> payload, string key, int defaultValue = 0)
    {
        if (payload == null) return defaultValue;
        return payload.ContainsKey(key) && int.TryParse(payload[key]?.ToString(), out var i) ? i : defaultValue;
    }

    /// <summary>
    /// Appends a query parameter to a URL, ensuring proper formatting.
    /// </summary>
    /// <param name="url">The base URL.</param>
    /// <param name="key">The key of the query parameter.</param>
    /// <param name="value">The value of the query parameter.</param>
    /// <returns>The URL with the appended query parameter.</returns>
    public static string AppendQueryParameter(string url, string key, string value)
    {
        var queryParam = $"{Uri.EscapeDataString(key)}={Uri.EscapeDataString(value)}";

        return url.Contains("?")
            ? $"{url}&{queryParam}"
            : $"{url}?{queryParam}";
    }

    /// <summary>
    /// Safely retrieves a list of values from the payload dictionary.
    /// Returns an empty list if the key doesn't exist or if the value is not a valid list.
    /// </summary>
    public static List<T> GetList<T>(Dictionary<string, object> payload, string key)
    {
        if (payload == null || !payload.ContainsKey(key)) return new List<T>();

        // Try to cast the value to a list of type T, return empty list if not successful
        if (payload[key] is List<object> listObj)
        {
            return listObj.Cast<T>().ToList();
        }

        return new List<T>();
    }
}