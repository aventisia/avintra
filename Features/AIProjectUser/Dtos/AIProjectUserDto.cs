namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Data Transfer Object (DTO) representing a user associated with an ML model.
/// </summary>
public class AIProjectUserDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the MLModelUser record.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the access type of the user within the ML model.
    /// </summary>
    public required ProjectUserAccessEnum AccessType { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the ML model that the user is linked to.
    /// </summary>
    [RequiredGuid]
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user associated with this ML model.
    /// </summary>
    [RequiredGuid]
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the full name of the user associated with the ML model.
    /// </summary>
    public string? UserFullName { get; set; }

    /// <summary>
    /// Gets or sets the username (unique identifier) of the user.
    /// </summary>
    public string? UserName { get; set; }

    /// <summary>
    /// Gets or sets the URL of the user's avatar image, if available.
    /// </summary>
    public string? AvatarSrc { get; set; }

    /// <summary>
    /// Gets or sets the initials of the user.
    /// </summary>
    public string? Initials { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the user was added to the ML model.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }
}
