namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a resource an agent uses, with who may share it and which recipients still need access.
/// </summary>
public class LinkedShareCandidateDto
{
    /// <summary>
    /// Gets or sets the type of the linked resource.
    /// </summary>
    public required ResourceTypeEnum ResourceType { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the linked resource.
    /// </summary>
    public required Guid ResourceId { get; set; }

    /// <summary>
    /// Gets or sets the name of the linked resource.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the display name of the resource's creator, or null when the creator is unknown.
    /// </summary>
    public string? OwnerName { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the linked resource is open to everyone in the tenant.
    /// </summary>
    public bool IsTenantWideAccess { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the current user may share the linked resource.
    /// </summary>
    public bool CanShare { get; set; }

    /// <summary>
    /// Gets or sets the recipients that still need access to the linked resource.
    /// </summary>
    public required List<Guid> UserIdsNeedingShare { get; set; }
}
