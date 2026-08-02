using System.Globalization;

namespace WorkspaceAPIs.Helpers;

public static class ApiKeyHelpers
{
    private const string KeyPrefix = "av-";

    // Generates a cryptographically secure API key in the format: av-<key>.
    public static string GenerateApiKey()
    {
        var keyBytes = RandomNumberGenerator.GetBytes(64);
        var generatedKey = Convert.ToBase64String(keyBytes)
            .Replace("+", "")
            .Replace("/", "")
            .Replace("=", "");
        return $"{KeyPrefix}{generatedKey}";
    }

    // Computes the SHA256 hash of a plain API key, returned as a lowercase hex string.
    public static string HashApiKey(string plainKey)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(plainKey));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    // Builds a masked prefix for display from a plain API key (6 visible chars + "...").
    public static string BuildKeyPrefix(string plainApiKey)
    {
        return plainApiKey.Length > 6 ? plainApiKey[..6] + "..." : plainApiKey;
    }

    // Validates that the supplied string is a workspace API key.
    // The key no longer embeds the tenant ID; the caller validates against the stored tenant separately.
    public static bool IsValidApiKeyFormat(string plainApiKey)
    {
        return !string.IsNullOrWhiteSpace(plainApiKey) && plainApiKey.StartsWith(KeyPrefix, StringComparison.Ordinal);
    }
}
