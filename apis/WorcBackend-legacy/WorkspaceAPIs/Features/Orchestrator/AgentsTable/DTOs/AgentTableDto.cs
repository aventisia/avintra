namespace WorkspaceAPIs.DTOs;

public class AgentTableDto
{
    /// <summary>
    /// Gets or sets the ID of the flow this version is associated with.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the ID of the flow this version is associated with.
    /// </summary>
    [RequiredGuid]
    public Guid RefId { get; set; }

    /// <summary>
    /// Gets or sets the name of the flow.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the type of the flow.
    /// </summary>
    public required string Type { get; set; }

    /// <summary>
    /// Gets or sets the machines count which are associated with the version flow (agent).
    /// </summary>
    public int? MachineCount { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the version is in locked state.
    /// </summary>
    public bool IsLocked { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the version is in draft state.
    /// </summary>
    public bool IsDraft { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the version has been published.
    /// </summary>
    public bool IsPublished { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the version has been archived.
    /// </summary>
    public bool IsArchived { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the flow version is assigned to all users.
    /// When true, the assignment applies to all team members instead of specific users.
    /// </summary>
    public bool IsAssignedToAllUsers { get; set; }

    /// <summary>
    /// Gets or sets the supported platforms for the flow version as a comma-separated string.
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
    /// Gets or sets the execution configuration for the flow version as a JSON string.
    /// </summary>
    public ExecutionSettings? Settings { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the record is disabled. Use this to mark a record as disabled if it's outdated or no longer required when deletion is not possible.
    /// </summary>
    public bool IsDisabled { get; set; } = false;

    /// <summary>
    /// Gets or sets the the user who created the record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the the username who created the record.
    /// </summary>
    public string? CreatedByUsername { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the version number of a flow version record
    /// </summary>
    public int VersionNumber { get; set; }

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