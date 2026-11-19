namespace NodeLibrary.Helpers;

internal static class CredentialReferenceHelper
{
    public static string? Read(JsonElement config)
    {
        if (config.ValueKind != JsonValueKind.Object) return null;
        return ReadString(config, "credential_name") ?? ReadString(config, "credential_id");
    }

    private static string? ReadString(JsonElement element, string key)
    {
        if (!element.TryGetProperty(key, out var prop) || prop.ValueKind != JsonValueKind.String) return null;
        return Normalize(prop.GetString());
    }

    // IMPORTANT NOTE: an all-zero GUID is how the flow builder clears a credential reference.
    private static string? Normalize(string? value) =>
        string.IsNullOrWhiteSpace(value) || value == "00000000-0000-0000-0000-000000000000"
            ? null
            : value;
}
