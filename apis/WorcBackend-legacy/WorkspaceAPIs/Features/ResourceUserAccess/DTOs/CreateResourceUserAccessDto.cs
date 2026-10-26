namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a recipient and assigned access level for a shared resource.
/// </summary>
public class ResourceUserAccessRecipientDto
{
    /// <summary>
    /// Gets or sets the access level assigned to the recipient user.
    /// </summary>
    public required ResourceAccessTypeEnum AccessLevel { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the user receiving access.
    /// </summary>
    public required Guid UserId { get; set; }
}

/// <summary>
/// Represents a request to share a resource with multiple users.
/// </summary>
public class CreateResourceUserAccessDto
{
    /// <summary>
    /// Gets or sets the type of resource being shared.
    /// </summary>
    public required ResourceTypeEnum ResourceType { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the shared resource.
    /// </summary>
    public required Guid ResourceId { get; set; }

    /// <summary>
    /// Gets or sets the list of recipients and their assigned access levels.
    /// </summary>
    public required List<ResourceUserAccessRecipientDto> Users { get; set; }
}