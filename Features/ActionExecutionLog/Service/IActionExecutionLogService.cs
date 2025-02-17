namespace WorkspaceAPIs.Services;
public interface IActionExecutionLogService
{
    /// <summary>
    /// Get a list of action execution logs of a flow using flow execution identifier
    /// </summary>
    /// <param name="flowExecutionId">Flow Execution Id</param>
    /// <returns>A list of action execution logs </returns>
    Task<ServiceResponse<IEnumerable<ActionExecutionLogDto>>> GetActionExecutionLogsAsync(Guid flowExecutionId);

    /// <summary>
    /// Creates new action execution log
    /// </summary>
    /// <param name="actionExecutionLogDto">Action Execution Log Dto</param>
    /// <returns>A newly created action execution log</returns>
    Task<ServiceResponse<ActionExecutionLogDto>> InsertActionExecutionLogAsync(ActionExecutionLogDto executionLogDto);

    /// <summary>
    /// Updates an execution log
    /// </summary>
    /// <param name="actionExecutionLogDto">Action Execution Log Dto</param>
    /// <returns>An updated action execution log</returns>
    Task<ServiceResponse<ActionExecutionLogDto>> UpdateActionExecutionLogAsync(ActionExecutionLogDto actionExecutionLogDto);

    /// <summary>
    /// Deletes an execution log
    /// </summary>
    /// <param name="id">Action Execution Log Id</param>
    /// <returns>True, if delete job successful, else false</returns>
    Task<ServiceResponse<bool>> DeleteActionExecutionLogAsync(Guid id);
}