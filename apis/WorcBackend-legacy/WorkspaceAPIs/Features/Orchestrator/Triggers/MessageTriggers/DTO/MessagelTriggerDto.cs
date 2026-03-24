namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Data Transfer Object (DTO) used for creating or updating an message trigger configuration.
/// This object represents the request payload sent by the client when configuring a mailbox-based message trigger within the system.
/// </summary>
public class MessageTriggerDto : MessageTriggerModel
{
    /// <summary>
    /// Gets or sets the unique identifier of the message trigger.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the message trigger.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the timezone in which the message trigger operates.
    /// </summary>
    [Required]
    public required string Timezone { get; set; }

    /// <summary>
    /// Gets or sets the collection of agents associated with the email trigger, including their identifiers, names, and versions.
    /// </summary>
    public List<AgentInfoDto>? Agents { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the message trigger is disabled.
    /// Nullable to allow differentiation between enabled, disabled, and unspecified states.
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the message trigger record.
    /// This property is for responses only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the message trigger record was created.
    /// This property is for responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the message trigger record.
    /// This property is for responses only and should not be included in requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the message trigger record was last modified.
    /// This property is for responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}