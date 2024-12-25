namespace WorkspaceAPIs.Services;
public interface IExecutionLogService
{
    /// <summary>
    /// Get a list of execution logs of a flow using flow identifier
    /// </summary>
    /// <param name="flowId">Flow Id</param>
    /// <returns>A list of execution logs </returns>
    Task<ServiceResponse<IEnumerable<ExecutionLogDto>>> GetExecutionLogsAsync(Guid flowId);

    /// <summary>
    /// Creates new execution log
    /// </summary>
    /// <param name="executionLogDto">Execution Log Dto</param>
    /// <returns>A newly created execution log</returns>
    Task<ServiceResponse<ExecutionLogDto>> InsertExecutionLogAsync(ExecutionLogDto executionLogDto);

    /// <summary>
    /// Updates an execution log
    /// </summary>
    /// <param name="flowVersionDto">Execution Log Dto</param>
    /// <returns>An updated execution log</returns>
    Task<ServiceResponse<ExecutionLogDto>> UpdateExecutionLogAsync(ExecutionLogDto executionLogDto);

    /// <summary>
    /// Deletes an execution log
    /// </summary>
    /// <param name="id">Log Id</param>
    /// <returns>True, if delete job successful, else false</returns>
    Task<ServiceResponse<bool>> DeleteExecutionLogAsync(Guid id);
}