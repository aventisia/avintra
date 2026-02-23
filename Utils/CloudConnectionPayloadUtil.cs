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
}