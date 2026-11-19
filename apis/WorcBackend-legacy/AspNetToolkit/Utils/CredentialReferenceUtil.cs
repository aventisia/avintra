using System.Text.Json.Nodes;

namespace AspNetToolkit.Utils;

/// <summary>Resolves the credential reference stored on a model-config object.</summary>
public static class CredentialReferenceUtil
{
    /// <summary>Returns the credential name, falling back to the legacy credential id.</summary>
    public static string? Resolve(JsonNode? config)
    {
        if (config is not JsonObject obj) return null;
        return Read(obj, "credential_name") ?? Read(obj, "credential_id");
    }

    /// <summary>Returns the credential name, falling back to the legacy credential id.</summary>
    public static string? Resolve(JsonElement config)
    {
        if (config.ValueKind != JsonValueKind.Object) return null;
        return Read(config, "credential_name") ?? Read(config, "credential_id");
    }

    private static string? Read(JsonObject obj, string key) =>
        Normalize(obj.TryGetPropertyValue(key, out var node) ? node?.ToString() : null);

    private static string? Read(JsonElement element, string key) =>
        Normalize(element.TryGetProperty(key, out var prop) && prop.ValueKind == JsonValueKind.String
            ? prop.GetString()
            : null);

    // IMPORTANT NOTE: an all-zero GUID is how the flow builder clears a credential reference.
    private static string? Normalize(string? value) =>
        string.IsNullOrWhiteSpace(value) || value == "00000000-0000-0000-0000-000000000000"
            ? null
            : value;
}
