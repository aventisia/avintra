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
    /// Gets or sets the agent associated with the email trigger, including its identifier, name, and version.
    /// </summary>
    public AgentInfoDto? Agent { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the webhook trigger is disabled.
    /// </summary>
    public bool? IsDisabled { get; set; }

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
