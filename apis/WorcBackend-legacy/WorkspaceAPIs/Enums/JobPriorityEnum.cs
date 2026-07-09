namespace WorkspaceAPIs.Enums;

/// <summary>
/// Enum representing the priority levels for a job.
/// </summary>
public enum JobPriorityEnum
{
    /// <summary>
    /// Low priority for jobs.
    /// </summary>
    [Description("Low priority job.")]
    Low,

    /// <summary>
    /// Normal priority for jobs.
    /// </summary>
    [Description("Normal priority job.")]
    Normal,

    /// <summary>
    /// High priority for jobs.
    /// </summary>
    [Description("High priority job.")]
    High,

    /// <summary>
    /// Critical priority for jobs.
    /// </summary>
    [Description("Critical priority job.")]
    Critical
}
