namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Data Transfer Object (DTO) representing a queue flow version, including essential details like ID, name, status, audit information, and associated flow version and queue IDs.
/// </summary>
public class QueueFlowVersionDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the queue flow version.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the flow version associated with the queue.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the name of the flow version that the queue is associated with.
    /// </summary>
    public string? FlowName { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the queue that the flow version belongs to.
    /// </summary>
    public Guid QueueId { get; set; }

    /// <summary>
    /// Gets or sets the name of the queue that the flow version is associated with.
    /// </summary>
    public string? QueueName { get; set; }

    /// <summary>
    /// Gets or sets the access type for the user or role on this queue flow version.
    /// </summary>
    public QueueWorkItemAccessTypesEnum AccessType { get; set; }

    /// <summary>
    /// Gets or sets the version number of a flow version record
    /// </summary>
    public int VersionNumber { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the queue flow version is disabled. This is nullable to distinguish between `true`, `false`, and `null`.
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the creator of the record. This is for response purposes only.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the timestamp of when the record was created. This is for response purposes only.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the last user who modified the record. This is for response purposes only.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the timestamp of when the record was last modified. This is for response purposes only.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}
