namespace AccountsAPIs.Entities;

/// <summary>
/// Represents a space in the system.
/// </summary>
[Table("Spaces")]
public class Space : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the ID of the tenant that owns this space.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the full name of the space. Must be unique. Maximum length is 50 characters.
    /// </summary>
    [MaxLength(50)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets a brief description of the space. Maximum length is 250 characters.
    /// </summary>
    [MaxLength(250)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this space is the system default.
    /// </summary>
    public bool IsDefault { get; set; } = false;

    /// <summary>
    /// Gets or sets the list of users associated with the space.
    /// </summary>
    public virtual ICollection<SpaceUser>? Users { get; set; }
}
