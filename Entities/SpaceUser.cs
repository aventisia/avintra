namespace AccountsAPIs.Entities;

/// <summary>
/// Represents the association between a user and a space, including user-specific status or metadata within that space.
/// </summary>
public class SpaceUser : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    
    /// <summary>
    /// Gets or sets the ID of the space to which the user is linked.
    /// </summary>
    public Guid SpaceId { get; set; }

    /// <summary>
    /// Navigation property to the associated space.
    /// </summary>
    public virtual Space? Space { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user associated with the space.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Navigation property to the associated user.
    /// </summary>
    public virtual AccountUser? User { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the user is currently active in the space.
    /// </summary>
    public bool IsActive { get; set; }
}