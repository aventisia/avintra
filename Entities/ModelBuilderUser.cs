namespace MLModelBuilderAPIs.Entities;

/// <summary>
/// Represents a user entity that stores user preferences specific to a model builder.
/// </summary>
/// <remarks>
/// This entity should not include common or authentication details, as those will be handled in the AccountUser class in the AccountsAPIs project.
/// </remarks>
[Table("ModelBuilderUser")]
public class ModelBuilderUser : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for the user.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the tenant for multi-tenancy architecture.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the user name. Maximum length: 254 characters.
    /// </summary>
    [MaxLength(254)]
    public required string UserName { get; set; }

    /// <summary>
    /// Gets or sets the user's first name. Maximum length: 50 characters.
    /// </summary>
    [MaxLength(50)]
    public required string FirstName { get; set; }

    /// <summary>
    /// Gets or sets the user's last name. Maximum length: 50 characters.
    /// </summary>
    [MaxLength(50)]
    public required string LastName { get; set; }

    /// <summary>
    /// Gets or sets the user's avatar (profile picture) source. Maximum length: 255 characters.
    /// </summary>
    [MaxLength(255)]
    public string? AvatarSrc { get; set; }

}