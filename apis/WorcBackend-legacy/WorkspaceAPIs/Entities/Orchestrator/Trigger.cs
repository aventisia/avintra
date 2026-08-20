namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a scheduled trigger configuration for a tenant.
/// This class stores information about the trigger’s name, operating timezone, 
/// metadata (e.g., email or subscription details), and associated flow versions.
/// </summary>
[Table("worc_Triggers")]
public class Trigger : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// The ID of the tenant that owns this trigger.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the space this trigger belongs to.
    /// Null indicates the trigger is in the default "Central" space (shared across the tenant).
    /// </summary>
    public Guid? SpaceId { get; set; }

    /// <summary>
    /// Gets or sets the deployment environment this trigger belongs to.
    /// Combined with tenant/space/name/trigger-type this enforces uniqueness per environment.
    /// </summary>
    public ConfigureEnvironmentType EnvType { get; set; } = ConfigureEnvironmentType.Dev;

    /// <summary>
    /// The name of the trigger.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// The type of trigger (Email, Chat, Webhook, Time-based, etc.).
    /// </summary>
    public TriggerTypesEnum TriggerType { get; set; }

    /// <summary>
    /// The timezone in which the trigger operates.
    /// </summary>
    [Required]
    public required string Timezone { get; set; }

    /// <summary>
    /// Stores additional trigger metadata, such as email or subscription information, in JSON format.
    /// </summary>
    public required JsonDocument Metadata { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the trigger is accessible to all users within the tenant.
    /// </summary>
    public bool IsTenantWideAccess { get; set; }

    /// <summary>
    /// Collection of flow versions associated with this trigger.
    /// Represents the workflows that are executed when the trigger fires.
    /// </summary>
    public virtual ICollection<TriggerFlowVersion> TriggerFlowVersions { get; set; } = new List<TriggerFlowVersion>();
}