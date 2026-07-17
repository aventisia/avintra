namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object for a flow record
/// </summary>
public class QueuesTableDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the queue.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the flow.
    /// </summary>
    [StringLength(255)]
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
    [Range(0, int.MaxValue)]
    public int MaximumRetryAttempts { get; set; }

    /// <summary>
    /// Gets or sets the input data schema in JSON format.
    /// </summary>
    public List<QueueSchemaDefinitionDto>? InputSchema { get; set; }

    /// <summary>
    /// Gets or sets the output data schema in JSON format.
    /// </summary>
    public string? OutputSchema { get; set; }

    /// <summary>
    /// Gets or sets the number of queue items currently in progress.
    /// </summary>
    public int InProgress { get; set; }

    /// <summary>
    /// Gets or sets the number of queue items that are pending.
    /// </summary>
    public int Pending { get; set; }

    /// <summary>
    /// Gets or sets the number of completed queue items.
    /// </summary>
    public int Completed { get; set; }

    /// <summary>
    /// Gets or sets the number of failed queue items.
    /// </summary>
    public int Failed { get; set; }

    /// <summary>
    /// Gets or sets the total number of items in the queue items.
    /// </summary>
    public int Total { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the queue is accessible to all users within the tenant.
    /// </summary>
    public bool IsTenantWideAccess { get; set; }

    /// <summary>
    /// Gets or sets the permission level granted to the user.
    /// </summary>
    public ResourceAccessTypeEnum AccessLevel { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the credential used to access resources associated with the queue.
    /// </summary>
    public Guid? CredentialId { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the user record is disabled.
    /// </summary>
    /// <remarks>
    /// Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
    /// </remarks>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the user record. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was created. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the user record.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was last modified. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}
