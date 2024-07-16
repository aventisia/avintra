namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the base class for user avatar DTOs.
/// </summary>
public abstract class UserAvatarBaseDto
{
    /// <summary>
    /// Gets or sets the username, which is a unique identifier for the user.
    /// </summary>
    public required string UserName { get; set; }

    /// <summary>
    /// Gets or sets the URL of the user's avatar image.
    /// </summary>
    public string? AvatarSrc { get; set; }

    /// <summary>
    /// Gets or sets the initials of the user.
    /// </summary>
    public required string Initials { get; set; }
}

