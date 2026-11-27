namespace WorkspaceAPIs.Enums;

/// <summary>
/// Which tenant-level credentials a by-name credential lookup may return.
/// </summary>
public enum TenantCredentialAccessEnum
{
    /// <summary>
    /// No tenant-level credential.
    /// </summary>
    None,

    /// <summary>
    /// Only a tenant-level credential that an enabled model provider uses.
    /// </summary>
    ProviderCredentials,

    /// <summary>
    /// Any tenant-level credential of the tenant.
    /// </summary>
    All
}
