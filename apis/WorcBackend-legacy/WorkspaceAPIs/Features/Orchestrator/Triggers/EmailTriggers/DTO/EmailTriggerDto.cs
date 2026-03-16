namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Data Transfer Object (DTO) used for creating or updating an email trigger configuration.
/// This object represents the request payload sent by the client when configuring a mailbox-based email trigger within the system.
/// </summary>
public class EmailTriggerDto : EmailTriggerModel
{
    /// <summary>
    /// Gets or sets the unique identifier of the email trigger.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the email trigger.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the timezone in which the email trigger operates.
    /// </summary>
    [Required]
    public required string Timezone { get; set; }

    /// <summary>
    /// Gets or sets the collection of agent identifiers associated with the email trigger.
    /// </summary>
    public List<Guid>? AgentIds { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the email trigger is disabled.
    /// Nullable to allow differentiation between enabled, disabled, and unspecified states.
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the email trigger record.
    /// This property is for responses only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the email trigger record was created.
    /// This property is for responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the email trigger record.
    /// This property is for responses only and should not be included in requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the email trigger record was last modified.
    /// This property is for responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}