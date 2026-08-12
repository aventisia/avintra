namespace WorkspaceAPIs.Services;

/// <summary>
/// Defines operations for managing per-node execution logs associated with a job.
/// </summary>
public interface INodeExecutionLogService
{
    /// <summary>
    /// Inserts a batch of node execution logs for the specified job.
    /// </summary>
    /// <param name="jobId">The unique identifier of the job.</param>
    /// <param name="logs">The collection of node execution logs to insert.</param>
    /// <returns>A task representing the asynchronous operation, containing the result of the insert operation.</returns>
    Task<ServiceResponse<bool>> InsertNodeExecutionLogsAsync(Guid jobId, List<NodeExecutionLogDto> logs);

    /// <summary>
    /// Retrieves all node execution logs for the specified job.
    /// </summary>
    /// <param name="jobId">The unique identifier of the job.</param>
    /// <returns>A task representing the asynchronous operation, containing the collection of node execution logs.</returns>
    Task<ServiceResponse<List<NodeExecutionLogDto>>> GetNodeExecutionLogsAsync(Guid jobId);

    /// <summary>
    /// Retrieves the most recent node execution log for the specified job.
    /// </summary>
    /// <param name="jobId">The unique identifier of the job.</param>
    /// <returns>A task representing the asynchronous operation, containing the last node execution log as a JSON document, or <c>null</c> if no logs exist.</returns>
    Task<ServiceResponse<JsonDocument?>> GetLastNodeExecutionLogAsync(Guid jobId);
}