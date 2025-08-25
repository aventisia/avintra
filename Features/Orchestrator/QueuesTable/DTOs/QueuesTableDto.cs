namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object for a flow record
/// </summary>
public class QueuesTableDto
{
    /// <summary>
    /// Gets or sets the flow record's primary key.
    /// </summary>
    /// <remarks>
    /// Note: Not making it required because the same DTO is used for insert and update.
    /// </remarks>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the flow.
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the count of pending items associated with the queue.
    /// </summary>
    public int? TotalPendingItems { get; set; }

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
