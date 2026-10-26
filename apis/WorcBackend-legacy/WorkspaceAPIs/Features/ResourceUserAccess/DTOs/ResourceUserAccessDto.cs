namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a Data Transfer Object (DTO) containing resource user access details,
/// including resource information, assigned access level, and recipient user details.
/// </summary>
public class ResourceUserAccessDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the resource user access.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the tenant that owns the shared resource.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the type of resource being shared.
    /// </summary>
    public required ResourceTypeEnum ResourceType { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the shared resource.
    /// </summary>
    public required Guid ResourceId { get; set; }

    /// <summary>
    /// Gets or sets the access level assigned to the recipient user.
    /// </summary>
    public required ResourceAccessTypeEnum AccessLevel { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the user receiving access.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the first name of the user receiving access.
    /// </summary>
    public string? FirstName { get; set; }

    /// <summary>
    /// Gets or sets the last name of the user receiving access.
    /// </summary>
    public string? LastName { get; set; }

    /// <summary>
    /// Gets or sets the username of the user receiving access.
    /// </summary>
    public string? Username { get; set; }
}