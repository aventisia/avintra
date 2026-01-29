namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Data Transfer Object (DTO) representing a queue user, including essential details like ID, name, status, audit information, and associated user and queue IDs.
/// </summary>
public class QueueUserDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the queue user.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the user associated with the queue.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the name of the user that the queue is associated with.
    /// </summary>
    public string? Username { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the queue that the user belongs to.
    /// </summary>
    public Guid QueueId { get; set; }

    /// <summary>
    /// Gets or sets the name of the queue that the user is associated with.
    /// </summary>
    public string? QueueName { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the user is disabled. This is nullable to distinguish between `true`, `false`, and `null`.
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
