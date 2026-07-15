namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents an event associated with a queue transaction.
/// </summary>
public class QueueTransactionEventDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the queue transaction event.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the type of event that occurred for the queue transaction.
    /// </summary>
    public QueueTransactionEventEnum EventType { get; set; }

    /// <summary>
    /// Gets or sets the event payload data.
    /// </summary>
    // TODO: Replace string with a strongly typed object or JSON document (e.g., JsonDocument/JsonNode) the event payload schema is finalized.
    public string Data { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the unique identifier of the associated queue transaction.
    /// </summary>
    public required Guid QueueTransactionId { get; set; }

    /// <summary>
    /// Gets or sets the name of the user who created the event.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the event was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the event was last modified.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}