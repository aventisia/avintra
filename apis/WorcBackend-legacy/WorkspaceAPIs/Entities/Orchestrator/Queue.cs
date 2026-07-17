namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents an entity that holds data related to a queue.
/// </summary>
[Table("Queues")]
public class Queue : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for the tenant, used for global filtering in a multi-tenant architecture.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the queue.
    /// This is a required field with a maximum length of 256 characters.
    /// </summary>
    [MaxLength(256)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the tyoe of the queue.
    /// </summary>
    public QueueTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the view type of the queue.
    /// This categorizes the queue by its business scenario or UI presentation.
    /// </summary>
    public QueueViewTypeEnum ViewType { get; set; }

    /// <summary>
    /// Gets or sets the list of destination queues to which items from this queue can be routed.
    /// </summary>
    public List<string>? RouteToQueues { get; set; }

    /// <summary>
    /// Gets or sets the description of the queue.
    /// This field is optional and can contain a maximum of 500 characters.
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether to enforce unique references in the queue.
    /// </summary>
    public bool IsUniqueReferencesEnforced { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether to store items in encrypted format.
    /// </summary>
    public bool IsStoredEncrypted { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether to retry processing failed items.
    /// </summary>
    public bool ShouldRetryFailedItems { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether to retry processing abandoned items.
    /// </summary>
    public bool ShouldRetryAbandonedItems { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of retry attempts for processing items.
    /// This value must be non-negative.
    /// </summary>
    [Required]
    [Range(0, int.MaxValue)]
    public int MaximumRetryAttempts { get; set; }

    /// <summary>
    /// Gets or sets the input data schema in JSON format.
    /// </summary>
    public string? InputSchema { get; set; }

    /// <summary>
    /// Gets or sets the output data schema in JSON format.
    /// </summary>
    public string? OutputSchema { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the queue is accessible to all users within the tenant.
    /// </summary>
    public bool IsTenantWideAccess { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the credential used to access resources associated with the queue.
    /// </summary>
    public Guid? CredentialId { get; set; }

    /// <summary>
    /// Configures the many-to-many relationship between queue transactions and queues.
    /// </summary>
    public virtual ICollection<QueueTransaction>? QueueTransactions { get; set; }

    /// <summary>
    /// Configures the many-to-many relationship between queue and flow versions.
    /// </summary>   
    public virtual ICollection<QueueFlowVersion>? QueueFlowVersions { get; set; }

    /// <summary>
    /// Configures the many-to-many relationship between queue and users.
    /// </summary>   
    public virtual ICollection<QueueUser>? QueueUsers { get; set; }
}
