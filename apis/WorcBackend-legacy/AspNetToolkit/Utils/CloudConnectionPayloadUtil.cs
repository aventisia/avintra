namespace AspNetToolkit.Utils;

public static class CloudConnectionPayloadUtil
{
    // Retrieves a value from the payload using a case-insensitive key lookup.
    private static object? GetPayloadValue(
        Dictionary<string, object>? payload,
        string key)
    {
        // Validate input before attempting any lookup.
        if (payload == null || string.IsNullOrWhiteSpace(key))
            return null;

        // Fast path: works when the dictionary was created using
        // StringComparer.OrdinalIgnoreCase.
        if (payload.TryGetValue(key, out var value))
            return value;

        // Fallback: perform a case-insensitive search for dictionaries
        // that were created with the default case-sensitive comparer.
        var match = payload.FirstOrDefault(
            f => string.Equals(
                f.Key,
                key,
                StringComparison.CurrentCultureIgnoreCase));

        // Return the matched value when found; otherwise null.
        return string.IsNullOrEmpty(match.Key)
            ? null
            : match.Value;
    }

    // Retrieves a string value from the payload using a case-insensitive key lookup.
    public static string GetValue(
        Dictionary<string, object>? payload,
        string key)
    {
        // Convert the value to a string and remove leading/trailing spaces.
        // Return an empty string if the value is missing or null.
        return GetPayloadValue(payload, key)?
            .ToString()?
            .Trim() ?? string.Empty;
    }

    // Retrieves a boolean value from the payload using a case-insensitive key lookup.
    public static bool GetBool(
        Dictionary<string, object>? payload,
        string key,
        bool defaultValue = false)
    {
        // Attempt to parse the value as a boolean. If parsing fails, return the supplied default.
        return bool.TryParse(
            GetPayloadValue(payload, key)?.ToString(),
            out var value)
            ? value
            : defaultValue;
    }

    // Retrieves an integer value from the payload using a case-insensitive key lookup.
    public static int GetInt(
        Dictionary<string, object>? payload,
        string key,
        int defaultValue = 0)
    {
        // Attempt to parse the value as an integer. If parsing fails, return the supplied default.
        return int.TryParse(
            GetPayloadValue(payload, key)?.ToString(),
            out var value)
            ? value
            : defaultValue;
    }

    // Retrieves a long value from the payload using a case-insensitive key lookup.
    public static long GetLong(
        Dictionary<string, object>? payload,
        string key,
        long defaultValue = 0)
    {
        // Attempt to parse the value as a long integer.
        // If parsing fails, return the supplied default.
        return long.TryParse(
            GetPayloadValue(payload, key)?.ToString(),
            out var value)
            ? value
            : defaultValue;
    }

    // Retrieves a strongly typed list from the payload using a case-insensitive key lookup.
    public static List<T> GetList<T>(
        Dictionary<string, object>? payload,
        string key)
    {
        // Retrieve the raw payload value.
        var value = GetPayloadValue(payload, key);

        // Convert to a strongly typed list when possible.
        // Otherwise return an empty collection.
        return value is IEnumerable<T> items
            ? items.ToList()
            : new List<T>();
    }

    // Appends a query string parameter to the specified URL while preserving any existing query string parameters.
    public static string AppendQueryParameter(
        string url,
        string key,
        string value)
    {
        // Ensure required arguments are provided.
        ArgumentException.ThrowIfNullOrWhiteSpace(url);
        ArgumentException.ThrowIfNullOrWhiteSpace(key);

        // URL-encode both the parameter name and value to ensure special characters are handled correctly.
        var queryParam =
            $"{Uri.EscapeDataString(key)}={Uri.EscapeDataString(value ?? string.Empty)}";

        // Preserve existing query parameters if present.
        return url.Contains('?', StringComparison.Ordinal)
            ? $"{url}&{queryParam}"
            : $"{url}?{queryParam}";
    }
}