namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Data Transfer Object (DTO) representing a flow version user, including essential details 
/// like ID, user information, status, audit data, and associated flow version details.
/// </summary>
public class FlowVersionUserDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the flow version user.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the associated user.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the first name of the associated user.
    /// </summary>
    public string? FirstName { get; set; }

    /// <summary>
    /// Gets or sets the last name of the associated user.
    /// </summary>
    public string? LastName { get; set; }

    /// <summary>
    /// Gets or sets the username of the associated user.
    /// </summary>
    public string? Username { get; set; }

    /// <summary>
    /// Gets or sets initials of the user who created the record.
    /// </summary>
    public string? CreatedByUserInitials { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the flow version.
    /// </summary>
    public required Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the flow version is assigned to all users.
    /// When true, the assignment applies to all team members instead of specific users.
    /// </summary>
    public bool IsAssignedToAllUsers { get; set; }

    /// <summary>
    /// Gets or sets the name of the flow version.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the version number of a flow version record
    /// </summary>
    public int VersionNumber { get; set; }
}