namespace WorkspaceAPIs.Enums;

/// <summary>
/// Determines how work items in a queue are assigned/claimed for processing.
/// </summary>
public enum QueueProcessingModeEnum
{
    /// <summary>
    /// Work items must be claimed in FIFO (first-in-first-out) order via the
    /// "Get Next Item" action. Users cannot freely pick a pending item.
    /// </summary>
    [Description("First In, First Out")]
    Fifo,

    /// <summary>
    /// Users may freely pick and open any work item to process it.
    /// </summary>
    [Description("Manual (free pick)")]
    Manual
}
