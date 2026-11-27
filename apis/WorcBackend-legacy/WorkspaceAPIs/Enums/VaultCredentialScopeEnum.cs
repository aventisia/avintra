namespace WorkspaceAPIs.Enums;

/// <summary>
/// Whether a vault credential belongs to one space and environment or to the whole tenant.
/// </summary>
public enum VaultCredentialScopeEnum
{
    /// <summary>
    /// Belongs to one space and environment.
    /// </summary>
    Space,

    /// <summary>
    /// Belongs to the tenant and works in every space and environment.
    /// </summary>
    Tenant
}
