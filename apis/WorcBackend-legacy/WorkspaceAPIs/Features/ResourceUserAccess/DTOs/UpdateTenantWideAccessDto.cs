namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents an update to tenant-wide access for a resource.
/// </summary>
public class UpdateTenantWideAccessDto
{
    /// <summary>
    /// Gets or sets the type of the resource.
    /// </summary>
    public required ResourceTypeEnum ResourceType { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the resource.
    /// </summary>
    public required Guid ResourceId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether all users in the tenant should have access to the resource.
    /// </summary>
    public bool IsTenantWideAccess { get; set; }
}