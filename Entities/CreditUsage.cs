namespace AccountsAPIs.Entities;

/// <summary>
/// Represents a log of credit usage by a user for a specific service.
/// Records when the credits were consumed, how many were used, and what they were used for.
/// </summary>
public class CreditUsage : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for the credit usage entry.
    /// </summary>
    [Key]
    public Guid Id { get; set; }
    
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }
    /// <summary>
    /// Gets or sets the date and time when the credits were used.
    /// Defaults to the current UTC time.
    /// </summary>
    public DateTimeOffset UsageOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the type of service where the credits were applied (e.g., OnPremGpuText).
    /// </summary>
    public required CreditServiceTypesEnum ServiceType { get; set; }

    /// <summary>
    /// Gets or sets the number of credits consumed.
    /// </summary>
    public int Credits { get; set; }

    /// <summary>
    /// Gets or sets the reference ID associated with the usage context (e.g., AgentId, ModelId).
    /// </summary>
    public Guid? RefId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who consumed the credits.
    /// </summary>
    public Guid? UsageByUserId { get; set; }

    /// <summary>
    /// Gets or sets the user who consumed the credits.
    /// </summary>
    [ForeignKey("UsageByUserId")]
    public virtual AccountUser? UsageByUser { get; set; }
}
