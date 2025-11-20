namespace AspNetToolkit.Enums;

public enum JobStatusTypesEnum
{
    /// <summary>
    /// Indicates that the job has been created but has not started running yet.
    /// </summary>
    [Description("Created")]
    Created,

    /// <summary>
    /// Indicates that the job is currently running.
    /// </summary>
    [Description("Running")]
    Running,

    /// <summary>
    /// Indicates that the job has been completed successfully.
    /// </summary>
    [Description("Completed")]
    Completed,

    /// <summary>
    /// Indicates that the job failed during execution.
    /// </summary>
    [Description("Failed")]
    Failed,

    /// <summary>
    /// Indicates that the job was canceled before completion.
    /// </summary>
    [Description("Canceled")]
    Canceled
}