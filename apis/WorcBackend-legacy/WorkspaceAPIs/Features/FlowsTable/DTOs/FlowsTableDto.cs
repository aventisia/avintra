namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object for a flow record
/// </summary>
public class FlowsTableDto
{
    /// <summary>
    /// Gets or sets the flow record's primary key.
    /// </summary>
    /// <remarks>
    /// Note: Not making it required because the same DTO is used for insert and update.
    /// </remarks>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the ID of the folder the flow is organized in. Null means the top level.
    /// </summary>
    /// <remarks>
    /// Note: Only honored on insert; use the dedicated folder update to move an existing flow.
    /// </remarks>
    public Guid? FolderId { get; set; }

    /// <summary>
    /// Gets or sets the type of the flow.
    /// </summary>
    public required FlowTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the name of the flow.
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the thumbnail of the flow.
    /// </summary>

    public string? Thumbnail { get; set; }

    /// <summary>
    /// Gets or sets the description of the flow. Max 500 characters.
    /// </summary>
    [StringLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the version number of a last flow version record
    /// </summary>
    public int VersionNumber { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the latest flow version is archived.
    /// </summary>
    public bool IsArchived { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the latest flow version is published.
    /// </summary>
    public bool IsPublished { get; set; }

    /// <summary>
    /// Gets or sets the supported platforms for the last flow version as a comma-separated string.
    /// </summary>
    public string? SupportedPlatform { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the flow is accessible to all users within the tenant.
    /// </summary>
    public bool IsTenantWideAccess { get; set; }

    /// <summary>
    /// Gets or sets the permission level granted to the user.
    /// </summary>
    public ResourceAccessTypeEnum AccessLevel { get; set; }

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
    /// Gets or sets the date and time when the flow record or its latest version was last modified.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }

    /// <summary>
    /// Gets or sets the distinct AI model names referenced by the agent's latest workflow.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public List<string>? AiModels { get; set; }

    /// <summary>
    /// Gets or sets the queues linked to the agent (flow) across its versions.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public List<AgentQueueDto>? Queues { get; set; }
}
