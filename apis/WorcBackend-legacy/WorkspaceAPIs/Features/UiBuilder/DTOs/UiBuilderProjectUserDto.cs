namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object for a custom UI builder project user assignment.
/// </summary>
public class UiBuilderProjectUserDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the UI builder project user.
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
    /// Gets or sets the initials of the associated user.
    /// </summary>
    public string? Initials { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the UI builder project.
    /// </summary>
    [RequiredGuid]
    public required Guid UiBuilderProjectId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the UI builder project is assigned to all users.
    /// When true, the assignment applies to all team members instead of specific users.
    /// </summary>
    public bool IsAssignedToAllUsers { get; set; }

    /// <summary>
    /// Gets or sets the name of the UI builder project.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the number of the newest generated version for the project, or 0 when none exist.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public int HeadVersionNumber { get; set; }
}
