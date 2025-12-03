namespace WorkspaceAPIs.Enums;

/// <summary>
/// Enum representing different execution statuses of an agent.
/// </summary>
public enum AgentExecutionStatus
{
    /// <summary>
    /// The job is being created.
    /// </summary>
    [Description("creating-job")]
    CreatingJob,

    /// <summary>
    /// The executor is being launched.
    /// </summary>
    [Description("launching-executor")]
    LaunchingExecutor,

    /// <summary>
    /// The job is currently being executed.
    /// </summary>
    [Description("executing")]
    Executing,

    /// <summary>
    /// The job execution has been paused.
    /// </summary>
    [Description("paused")]
    Paused,

    /// <summary>
    /// The job has been stopped.
    /// </summary>
    [Description("stopped")]
    Stopped
}