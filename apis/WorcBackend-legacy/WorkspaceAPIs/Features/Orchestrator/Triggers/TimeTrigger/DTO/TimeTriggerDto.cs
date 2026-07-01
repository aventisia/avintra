namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object for creating or updating a time-based message trigger configuration.
/// This DTO is used as the request payload for configuring mailbox-based triggers within the system.
/// </summary>
public class TimeTriggerDto : TimeTriggerModel
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
    /// Gets or sets the time zone in which the trigger operates.
    /// </summary>
    [Required]
    public required string Timezone { get; set; }

    /// <summary>
    /// Gets or sets the list of agents associated with this trigger, including their identifiers, names, and versions.
    /// </summary>
    public List<AgentInfoDto>? Agents { get; set; }

    /// <summary>
    /// Indicates whether this trigger is accessible to all users within the tenant.
    /// </summary>
    public bool IsTenantWideAccess { get; set; }

    /// <summary>
    /// Gets or sets the access level assigned to the user for this resource.
    /// </summary>
    public ResourceAccessTypeEnum AccessLevel { get; set; }

    /// <summary>
    /// Indicates whether the trigger is disabled.
    /// A nullable value allows distinguishing between enabled, disabled, and unspecified states.
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets the username of the user who created this record.
    /// This property is intended for responses only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets the date and time when this record was created.
    /// Intended for response payloads only.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets the username of the user who last modified this record.
    /// Intended for response payloads only.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets the date and time when this record was last modified.
    /// Intended for response payloads only.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}