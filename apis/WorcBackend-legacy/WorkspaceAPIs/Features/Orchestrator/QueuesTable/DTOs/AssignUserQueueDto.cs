namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object (DTO) for a AssignUserQueueDto.
/// </summary>
public class AssignUserQueueDto
{
    /// <summary>
    /// Gets or sets Id of the agent.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets Id of the queue
    /// </summary>
    [RequiredGuid]
    public required Guid QueueId { get; set; }

    /// <summary>
    /// Gets or sets the name of the user.
    /// </summary>
    public string? Name { get; set; }

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

    /// <summary>
    /// Gets or sets initials of the user who created the record
    /// </summary>
    public string? CreatedByUserInitials { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the user is assigned.
    /// </summary>
    public bool IsAssigned { get; set; }
}
