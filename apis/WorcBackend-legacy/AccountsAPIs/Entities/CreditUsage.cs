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
    /// Gets or sets the timestamp when the credits were used.
    /// </summary>
    public DateTimeOffset UsedAt { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the type of service for which the credits were consumed.
    /// </summary>
    public CreditServiceTypesEnum ServiceType { get; set; }

    /// <summary>
    /// Gets or sets the number of credits that were consumed.
    /// </summary>
    public double CreditsUsed { get; set; }

    /// <summary>
    /// Gets or sets how much usage is in one unit, like 30 seconds or 1000 tokens.
    /// </summary>
    public double UnitUsed { get; set; }

    /// <summary>
    /// Gets or sets the type of the entity or operation the credits were used for (e.g., Agent, Model).
    /// </summary>
    public UsageSourceTypesEnum? RefType { get; set; }

    /// <summary>
    /// Gets or sets the type of the entity or operation the credits were used for (e.g., AgentExecution).
    /// </summary>
    public ActionTypesEnum? Action { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the specific reference associated with the usage context (e.g., AgentId, ModelId).
    /// </summary>
    public Guid? RefId { get; set; }

    /// <summary>
    /// Gets or sets the display name or description of the reference entity associated with the usage.
    /// </summary>
    public string? RefName { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the user who consumed the credits.
    /// </summary>
    public Guid? UsedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the name or identifier of the agent that triggered the consumption of credits. 
    /// </summary>
    public string? TriggeredByAgent { get; set; }
    
    /// <summary>
    /// Gets or sets the user who consumed the credits.
    /// </summary>
    [ForeignKey("UsedByUserId")]
    public virtual AccountUser? UsedByUser { get; set; }
}
