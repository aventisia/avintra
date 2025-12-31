namespace MLModelBuilderAPIs.Enums;

/// <summary>
/// Represents the status of a scheduled model operation.
/// </summary>
public enum ScheduleTypesEnum
{
    /// <summary>
    /// The scheduled operation is pending and has not started yet.
    /// </summary>
    Scheduled,

    /// <summary>
    /// The scheduled operation is currently in progress.
    /// </summary>
    InProgress,

    /// <summary>
    /// The scheduled operation completed successfully.
    /// </summary>
    Completed,

    /// <summary>
    /// The scheduled operation failed.
    /// </summary>
    Failed,

    /// <summary>
    /// The scheduled operation was canceled.
    /// </summary>
    Canceled
}
