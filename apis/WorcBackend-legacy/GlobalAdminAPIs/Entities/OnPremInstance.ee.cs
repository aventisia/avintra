namespace GlobalAdminAPIs.Entities;

/// <summary>
/// Represents an on-premises instance, which is associated with a specific tenant.
/// This entity holds all the details about a particular instance including its validation, deployment status, 
/// and related data for the platform.
/// </summary>
[Table("ga_OnPremInstances")]
public class OnPremInstance
{
    /// <summary>
    /// Gets or sets the unique identifier for the instance.
    /// This is the primary key for the instance validation.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the instance (e.g., "prod-instance", "staging-instance", "IT-instance").
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the type of the instance, indicating whether it's a production or non-production instance.
    /// </summary>
    public OnPremInstanceTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the platform version of the instance.
    /// </summary>
    public string? PlatformVersion { get; set; }

    /// <summary>
    /// Gets or sets the deployment date of the instance.
    /// </summary>
    public DateTimeOffset? DeployedOn { get; set; }

    /// <summary>
    /// Gets or sets the date the instance was last validated.
    /// </summary>
    public DateTimeOffset? LastValidatedOn { get; set; }

    /// <summary>
    /// Gets or sets the number of invalid checks performed on the instance.
    /// This could represent failed validation or health check attempts.
    /// </summary>
    public int NoOfInvalidCheck { get; set; }

    /// <summary>
    /// Gets or sets the user who created this tenant record.
    /// </summary>
    public required string CreatedByUser { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the tenant record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the foreign key for the related OnPremIn.
    /// </summary>
    public required Guid OnPremTenantId { get; set; }

    /// <summary>
    /// Gets or sets the related OnPremTenant entity.
    /// This navigation property allows access to the associated tenant for this instance.
    /// </summary>
    [ForeignKey("OnPremTenantId")]
    public virtual OnPremTenant? OnPremTenant { get; set; }

    /// <summary>
    /// Gets or sets the collection of OnPremInstanceData associated with this instance.
    /// This represents any instance-specific data or logs related to the instance.
    /// </summary>
    public virtual ICollection<OnPremInstanceData> OnPremInstanceData { get; set; } = new List<OnPremInstanceData>();
}