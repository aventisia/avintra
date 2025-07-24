namespace MLModelBuilderAPIs.Entities;

/// <summary>
/// Represents a user's access and association with a specific ML model within a tenant.
/// </summary>
[Table("MLModelUsers")]
public class MLModelUser : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant ID for multi-tenancy support.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the user's access type for the associated ML model.
    /// </summary>
    public AgentAccessTypesEnum AccessType { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user linked to the ML model.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the navigation reference to the user.
    /// </summary>
    [ForeignKey("UserId")]
    public virtual ModelBuilderUser? User { get; set; }

    /// <summary>
    /// Gets or sets the ID of the associated ML model.
    /// </summary>
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the navigation reference to the ML model.
    /// </summary>
    [ForeignKey("MLModelId")]
    public virtual MLModel? MLModel { get; set; }
}
