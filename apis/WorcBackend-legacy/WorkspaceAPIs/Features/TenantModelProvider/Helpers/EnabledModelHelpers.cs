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

    /// <summary>
    /// Determines whether a model capability satisfies the requested capability.
    /// </summary>
    public static bool IsCapabilityMatch(ModelCapabilityEnum? modelCapability, ModelCapabilityEnum requestedCapability)
    {
        // IMPORTANT NOTE: Legacy enabled models have no capability; they default to Text.
        return modelCapability == requestedCapability
            || (requestedCapability == ModelCapabilityEnum.Text && modelCapability == null);
    }
}
