namespace AccountsAPIs.Entities;

/// <summary>
/// Represents a log of consumption by a user who brought their own key (BYOK)
/// for a specific service. Unlike <see cref="CreditUsage"/>, BYOK consumption is
/// not billed against platform credits — it records the provider's own unit of
/// measurement (tokens, seconds, characters) so admins can see how much the
/// user's own key consumed.
/// </summary>
public class ByokUsage : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for the BYOK usage entry.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the space this BYOK usage belongs to.
    /// Null indicates the default "Central" space (shared across the tenant).
    /// </summary>
    public Guid? SpaceId { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the consumption occurred.
    /// </summary>
    public DateTimeOffset UsedAt { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the type of service for which the consumption occurred.
    /// </summary>
    public CreditServicesEnum ServiceType { get; set; }

    /// <summary>
    /// Gets or sets the model provider name (e.g. "openai", "gemini", "elevenlabs").
    /// Used to group BYOK consumption charts by provider.
    /// </summary>
    public string? Provider { get; set; }

    /// <summary>
    /// Gets or sets the model name (e.g. "gpt-4o-mini", "gemini-2.5-flash").
    /// Used to title per-model consumption charts within a provider.
    /// </summary>
    public string? Model { get; set; }

    /// <summary>
    /// Gets or sets the number of provider units consumed (tokens, seconds, characters).
    /// </summary>
    public double ConsumedUnit { get; set; }

    /// <summary>
    /// Gets or sets the unit of measurement for the consumed amount (e.g. Tokens, Seconds, Characters).
    /// </summary>
    public UnitTypesEnum? UnitType { get; set; }

    /// <summary>
    /// Gets or sets the display name of the vault credential (BYOK key) that was used.
    /// </summary>
    public string? CredentialName { get; set; }

    /// <summary>
    /// Gets or sets the type of the entity or operation the consumption was used for (e.g., Agent, Model).
    /// </summary>
    public UsageSourceTypesEnum? RefType { get; set; }

    /// <summary>
    /// Gets or sets the type of the entity or operation the consumption was used for (e.g., AgentExecution).
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
    /// Gets or sets the identifier of the user who consumed the units.
    /// </summary>
    public Guid? UsedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the name or identifier of the agent that triggered the consumption.
    /// </summary>
    public string? TriggeredByAgent { get; set; }

    /// <summary>
    /// Gets or sets the user who consumed the units.
    /// </summary>
    [ForeignKey("UsedByUserId")]
    public virtual AccountUser? UsedByUser { get; set; }
}