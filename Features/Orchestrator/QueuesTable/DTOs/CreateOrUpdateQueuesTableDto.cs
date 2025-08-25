namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object for creating or updating a queue record.
/// </summary>
public class CreateOrUpdateQueuesTableDto
{
    /// <summary>
    /// Gets or sets the flow record's primary key.
    /// </summary>
    /// <remarks>
    /// Note: Not making it required because the same DTO is used for insert and update.
    /// </remarks>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the queue.
    /// This field is required and must not exceed 255 characters.
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the queue.
    /// This field is optional and can be up to 500 characters long.
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Indicates whether unique references should be enforced in the queue.
    /// </summary>
    public bool IsUniqueReferencesEnforced { get; set; }

    /// <summary>
    /// Indicates whether items should be stored in an encrypted format.
    /// </summary>
    public bool IsStoredEncrypted { get; set; }

    /// <summary>
    /// Indicates whether to attempt retries for processing failed items.
    /// </summary>
    public bool ShouldRetryFailedItems { get; set; }

    /// <summary>
    /// Indicates whether to attempt retries for processing abandoned items.
    /// </summary>
    public bool ShouldRetryAbandonedItems { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of retry attempts allowed for processing items.
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
    /// Indicates whether the user record is disabled.
    /// This property is nullable to differentiate between true, false, and null values.
    /// </summary>
    public bool? IsDisabled { get; set; }
}
