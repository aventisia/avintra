namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a tenant user returned by the user search.
/// </summary>
public class SearchedUserDto
{
    /// <summary>
    /// Gets or sets the user's unique identifier.
    /// </summary>
    [RequiredGuid]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the user name (max length 254).
    /// </summary>
    [StringLength(254)]
    public required string UserName { get; set; }

    /// <summary>
    /// Gets or sets the user's first name (max length 50).
    /// </summary>
    [StringLength(50)]
    public required string FirstName { get; set; }

    /// <summary>
    /// Gets or sets the user's last name (max length 50).
    /// </summary>
    [StringLength(50)]
    public required string LastName { get; set; }

    /// <summary>
    /// Gets or sets the source of the user's avatar (profile pic) (max length 255).
    /// </summary>
    [StringLength(255)]
    public string? AvatarSrc { get; set; }
}
