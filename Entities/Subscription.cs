
namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents an entity that stores subscription data
/// </summary>
public class Subscription : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the start date of a plan subscription
    /// </summary>
    public DateTimeOffset StartDate { get; set; } 

    /// <summary>
    /// Gets or sets the due date of a plan subscription
    /// </summary>
    public DateTimeOffset DueDate { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the subscription is active or not
    /// </summary>
    public bool IsActive { get; set; }

    
	/// <summary>
    /// Gets or sets the Id of a plan, this subscription is associated with
    /// </summary>
    public Guid PlanId { get; set; }

    /// <summary>
    /// Gets or sets the plan, this subscription is associated with
    /// </summary>
    [ForeignKey("PlanId")]
    public virtual Plan? Plan { get; set; } 

}

