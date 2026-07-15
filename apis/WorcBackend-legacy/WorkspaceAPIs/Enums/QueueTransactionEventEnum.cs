namespace WorkspaceAPIs.Enums;

/// <summary>
/// Represents the different event types related to work item changes.
/// </summary>
public enum QueueTransactionEventEnum
{
    /// <summary>
    /// Event when a comment is added to a work item.
    /// </summary>
    [Description("Event when a comment is added to a work item.")]
    CommentAdded,

    /// <summary>
    /// Event when the status of a work item is changed.
    /// </summary>
    [Description("Event when the status of a work item is changed.")]
    StatusChange,

    /// <summary>
    /// Event when a work item is closed.
    /// </summary>
    [Description("Event when a work item is closed.")]
    Closed,

    /// <summary>
    /// Event triggered when a work item is routed to another queue.
    /// </summary>
    [Description("Event triggered when a work item is routed to another queue.")]
    QueueTransactionRouted,

    // TODO: Add future queue transaction events to this enum as needed.
    /// <summary>
    /// Event when a comment is removed from a work item.
    /// </summary>
    [Description("Event when a comment is removed from a work item.")]
    CommentRemoved,

    /// <summary>
    /// Event when a comment is updated on a work item.
    /// </summary>
    [Description("Event when a comment is updated on a work item.")]
    CommentUpdated,

    /// <summary>
    /// Event when the description of a work item is updated.
    /// </summary>
    [Description("Event when the description of a work item is updated.")]
    DescriptionUpdated,

    /// <summary>
    /// Event when an attachment is added to a work item.
    /// </summary>
    [Description("Event when an attachment is added to a work item.")]
    AttachmentAdded,

    /// <summary>
    /// Event when an attachment is removed from a work item.
    /// </summary>
    [Description("Event when an attachment is removed from a work item.")]
    AttachmentRemoved,

    /// <summary>
    /// Event when the assigned user of a work item is changed.
    /// </summary>
    [Description("Event when the assigned user of a work item is changed.")]
    AssignedUserChanged,

    /// <summary>
    /// Event when a queue transaction is completed.
    /// </summary>
    [Description("Event when a queue transaction is completed.")]
    QueueTransactionCompleted,

    /// <summary>
    /// Event when a queue transaction is created.
    /// </summary>
    [Description("Event when a queue transaction is created.")]
    QueueTransactionCreated,

    /// <summary>
    /// Event when a queue transaction is reopened after being completed or closed.
    /// </summary>
    [Description("Event when a queue transaction is reopened after being completed or closed.")]
    QueueTransactionReopened
}