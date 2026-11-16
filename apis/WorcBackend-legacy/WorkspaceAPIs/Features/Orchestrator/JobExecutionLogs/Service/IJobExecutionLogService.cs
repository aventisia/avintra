namespace WorkspaceAPIs.Services;

/// <summary>
/// Defines operations for retrieving and managing job execution logs.
/// </summary>
public interface IJobExecutionLogService
{
    /// <summary>
    /// Retrieves all execution logs for a specific flow version.
    /// </summary>
    /// <param name="flowVersionId">The unique identifier of the flow version.</param>
    /// <returns>
    /// A task representing the asynchronous operation, containing a collection of job execution logs.
    /// </returns>
    Task<ServiceResponse<IEnumerable<JobExecutionLogDto>>> GetLogsByFlowVersionAsync(Guid flowVersionId);

    /// <summary>
    /// Retrieves detailed information for a specific job execution.
    /// </summary>
    /// <param name="jobId">The unique identifier of the job execution.</param>
    /// <returns>
    /// A task representing the asynchronous operation, containing detailed job execution information.
    /// </returns>
    Task<ServiceResponse<JobExecutionLogDetailDto>> GetLogDetailAsync(Guid jobId);

    /// <summary>
    /// Retrieves an agent's run counts, outcomes, and average duration across all of its versions.
    /// </summary>
    /// <param name="flowId">The unique identifier of the agent.</param>
    /// <param name="days">The number of local days to cover, ending today.</param>
    /// <param name="utcOffsetMinutes">The caller's UTC offset in minutes, used to bucket runs by local day.</param>
    /// <returns>
    /// A task representing the asynchronous operation, containing the agent's run activity.
    /// </returns>
    Task<ServiceResponse<AgentRunActivityDto>> GetRunActivityAsync(Guid flowId, int days, int utcOffsetMinutes);
}