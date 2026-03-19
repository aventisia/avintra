namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Data Transfer Object for creating or updating a webhook trigger configuration.
/// </summary>
public class WebhookTriggerDto : WebhookTriggerModel
{
    /// <summary>
    /// Gets or sets the unique identifier of the webhook trigger.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the display name of the webhook trigger.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the timezone for the trigger (defaults to UTC).
    /// </summary>
    [Required]
    public required string Timezone { get; set; }

    /// <summary>
    /// Gets or sets the FlowVersion ID of the single agent linked to this webhook trigger.
    /// </summary>
    public Guid? AgentId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the webhook trigger is disabled.
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the plain-text API key. Populated ONLY on Create and RegenerateApiKey responses; null on all other reads.
    /// </summary>
    public string? ApiKey { get; set; }

    /// <summary>
    /// Gets or sets the webhook URL for this trigger. Computed at read time; never stored.
    /// </summary>
    public string? WebhookUrl { get; set; }

    /// <summary>
    /// Gets or sets the full name of the user who created the webhook trigger.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the webhook trigger was created.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the full name of the user who last modified the webhook trigger.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the webhook trigger was last modified.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}
