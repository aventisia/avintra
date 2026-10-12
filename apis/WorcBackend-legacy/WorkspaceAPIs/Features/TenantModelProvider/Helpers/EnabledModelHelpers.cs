namespace WorkspaceAPIs.Features.TenantModelProvider.Helpers;

/// <summary>
/// Provides helpers for reading the capability stored for an enabled model.
/// </summary>
public static class EnabledModelHelpers
{
    /// <summary>
    /// Parses a stored capability string, returning null when it is empty or unknown.
    /// </summary>
    public static ModelCapabilityEnum? ParseCapability(string? capability)
    {
        if (string.IsNullOrWhiteSpace(capability))
            return null;

        return Enum.TryParse<ModelCapabilityEnum>(capability.Trim(), true, out var parsed) ? parsed : null;
    }
}
