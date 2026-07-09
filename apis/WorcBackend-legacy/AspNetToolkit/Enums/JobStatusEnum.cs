namespace AspNetToolkit.Enums;

public enum JobStatusEnum
{
    /// <summary>
    /// Indicates that the job has been created but has not started running yet.
    /// </summary>
    [Description("Created")]
    Created,

    /// <summary>
    /// Indicates that the job is currently in the process of running.
    /// </summary>
    [Description("Running")]
    Running,

    /// <summary>
    /// Indicates that the job has been successfully completed.
    /// </summary>
    [Description("Completed")]
    Completed,

    /// <summary>
    /// Immediately terminates the job and processes.
    /// </summary>
    [Description("Aborted")]
    Abort,

    /// <summary>
    /// Indicates that the job failed during execution.
    /// </summary>
    [Description("Failed")]
    Failed,

    /// <summary>
    /// Indicates that the job was canceled before completion.
    /// </summary>
    [Description("Canceled")]
    Canceled,

    /// <summary>
    /// Indicates that the job is paused temporarily and can be resumed later.
    /// </summary>
    [Description("Paused")]
    Paused,

    /// <summary>
    /// Indicates that the job has resumed after a pause or interruption.
    /// </summary>
    [Description("Resumed")]
    Resumed,

    /// <summary>
    /// Indicates that the job has been marked for cleanup and is being finalized.
    /// </summary>
    [Description("Cleanup")]
    Cleanup,

    /// <summary>
    /// Indicates that the job is in a state where it is being retried after a failure.
    /// </summary>
    [Description("Retrying")]
    Retrying,

    /// <summary>
    /// Indicates that the job was forcefully terminated, typically because it exceeded its maximum execution time or was killed by the execution monitor.
    /// </summary>
    [Description("Killed")]
    Killed
}
