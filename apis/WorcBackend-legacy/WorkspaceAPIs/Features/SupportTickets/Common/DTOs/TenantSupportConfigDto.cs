namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the support configuration for a tenant, exposed to tenant admins so the
/// UI can conditionally show/hide tenant-specific support options (e.g. Change Requests).
/// </summary>
public class TenantSupportConfigDto
{
    /// <summary>
    /// Gets or sets a value indicating whether Change Requests are enabled for the tenant.
    /// When disabled, the "Change Request" option must not be shown when creating a ticket.
    /// </summary>
    public bool IsChangeRequestEnabled { get; set; }
}
