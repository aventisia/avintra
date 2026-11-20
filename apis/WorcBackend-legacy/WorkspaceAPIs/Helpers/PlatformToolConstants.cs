namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Names shared by the library-tool catalog and the config-store endpoints that hide its marker row.
/// </summary>
public static class PlatformToolConstants
{
    /// <summary>
    /// Reserved config-store name written by earlier releases to mark a tenant as materialized.
    /// Tenant enablement now lives only in <c>ai_TenantPlatformTools</c>, but existing rows stay
    /// hidden and protected so they cannot surface as user key stores.
    /// </summary>
    public const string MaterializedMarkerName = "__platform_tools_seeded";
}
