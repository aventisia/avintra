namespace WorkspaceAPIs.Enums;

public enum ExecutionCommandTypesEnum
{
    /// <summary>
    /// Initiates a new job, workflow, or script execution on the agent.
    /// </summary>
    [Description("Initiate execution of a job or workflow")]
    Execute,

    /// <summary>
    /// Requests a graceful stop, allowing the job to finish its current task.
    /// </summary>
    [Description("Gracefully stop the running job")]
    Stop,

    /// <summary>
    /// Forces an immediate termination of the current job and its processes.
    /// </summary>
    [Description("Forcefully terminate the running job")]
    Abort,

    /// <summary>
    /// Temporarily suspends the execution of the job.
    /// </summary>
    [Description("Pause the running job")]
    Pause,

    /// <summary>
    /// Resumes execution of a previously paused job.
    /// </summary>
    [Description("Resume the paused job")]
    Resume,

    /// <summary>
    /// Retrieves the current execution status of the job.
    /// </summary>
    [Description("Retrieve current job execution status")]
    Status,

    /// <summary>
    /// Sends a health check or heartbeat signal from the agent to indicate its availability.
    /// </summary>
    [Description("Agent health check or heartbeat")]
    Heartbeat,

    /// <summary>
    /// Cancels a job that has been scheduled but not yet started.
    /// </summary>
    [Description("Cancel a scheduled job")]
    Cancel,

    /// <summary>
    /// Instructs the agent to clean up resources associated with a job.
    /// </summary>
    [Description("Clean up job-related resources")]
    Cleanup
}