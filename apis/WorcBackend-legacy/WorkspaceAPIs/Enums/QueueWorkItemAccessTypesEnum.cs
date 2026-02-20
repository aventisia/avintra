namespace WorkspaceAPIs.Enums;

/// <summary>
/// Defines the different types of access that can be assigned to queue work items.
/// </summary>
public enum QueueWorkItemAccessTypesEnum
{
    /// <summary>
    /// Provides unrestricted access to all actions on queue work items.
    /// </summary>
    [Description("Provides unrestricted access to all actions on queue work items.")]
    FullAccess,

    /// <summary>
    /// Allows users to view queue work items without making any changes.
    /// </summary>
    [Description("Allows users to view queue work items without making any changes.")]
    View,

    /// <summary>
    /// Grants permission to add new items to the queue.
    /// </summary>
    [Description("Grants permission to add new items to the queue.")]
    Create,

    /// <summary>
    /// Permits modification of the state or details of a queue work item.
    /// </summary>
    [Description("Permits modification of the state or details of a queue work item.")]
    Edit,

    /// <summary>
    /// Grants permission to remove or process items from the queue.
    /// </summary>
    [Description("Grants permission to remove or process items from the queue.")]
    Delete
}
