namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents detailed information about a space, including metadata.
/// </summary>
public class SpaceTableDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the space.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the space. Must be unique with a maximum length of 50 characters.
    /// </summary>
    [MaxLength(50)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets an optional description for the space. Maximum length is 250 characters.
    /// </summary>
    [MaxLength(250)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the space is disabled.
    /// Nullable to distinguish between enabled, disabled, or undefined states.
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this space is the system default.
    /// </summary>
    public bool IsDefault { get; set; }

    /// <summary>
    /// Gets or sets the total number of users associated with the space.
    /// </summary>
    public int TotalUsers { get; set; }

    /// <summary>
    /// Gets or sets the total number of published agents in the space.
    /// </summary>
    public int TotalPublishedAgents { get; set; }

    /// <summary>
    /// Gets or sets the total execution time (in seconds) for the space.
    /// </summary>
    public double TotalExecutionTime { get; set; }

    /// <summary>
    /// Gets or sets the total number of machines attached to the space.
    /// </summary>
    public int TotalMachinesAttached { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created this space record.
    /// For response use only.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when this space record was created.
    /// For response use only.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified this space record.
    /// For response use only.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when this space record was last modified.
    /// For response use only.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}

/// <summary>
/// Represents a user associated with a space.
/// </summary>
public class SpaceUserDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the user.
    /// Optional for creation scenarios.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the user's first name. Maximum length is 50 characters.
    /// </summary>
    [StringLength(50)]
    public required string FirstName { get; set; }

    /// <summary>
    /// Gets or sets the user's last name. Maximum length is 50 characters.
    /// </summary>
    [StringLength(50)]
    public required string LastName { get; set; }

    /// <summary>
    /// Gets or sets the user's email or username. Maximum length is 254 characters.
    /// </summary>
    [StringLength(254)]
    public required string Email { get; set; }
}

/// <summary>
/// Data transfer object used to create or update a space and its associated users.
/// </summary>
public class SpaceDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the space.
    /// Required for updates, optional for creation.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the space. Must be unique and up to 50 characters.
    /// </summary>
    [MaxLength(50)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets an optional description of the space. Maximum length is 250 characters.
    /// </summary>
    [MaxLength(250)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets a list of user IDs to associate with the space.
    /// </summary>
    public List<Guid> UserIds { get; set; } = new();
}