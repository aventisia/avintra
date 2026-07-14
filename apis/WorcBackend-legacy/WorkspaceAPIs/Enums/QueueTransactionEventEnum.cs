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
    StatusChanged,

    // TODO: Extend this enum with new queue transaction events as needed.
}