namespace WorkspaceAPIs.Enums;

/// <summary>
/// Defines the available columns to sort queue transactions by.
/// </summary>
public enum QueueItemSortSortByFieldsEnum
{
    /// <summary>
    /// Sort by the status of the transaction.
    /// </summary>
    [Description("Sort by status")]
    Status,

    /// <summary>
    /// Sort by the date the transaction was created or modified.
    /// </summary>
    [Description("Sort by date")]
    Date,

    /// <summary>
    /// Sort by the priority of the transaction.
    /// </summary>
    [Description("Sort by priority")]
    Priority
}
