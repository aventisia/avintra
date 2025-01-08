namespace WorkspaceAPIs.Services;
public interface IFlowExecutionLogService
{
    /// <summary>
    /// Get a list of flow execution logs of a flow using flow identifier
    /// </summary>
    /// <param name="flowId">Flow Id</param>
    /// <returns>A list of flow execution logs </returns>
    Task<ServiceResponse<IEnumerable<FlowExecutionLogDto>>> GetFlowExecutionLogsAsync(Guid flowId);

    /// <summary>
    /// Creates new flow execution log
    /// </summary>
    /// <param name="flowExecutionLogDto">Flow Execution Log Dto</param>
    /// <returns>A newly created flow execution log</returns>
    Task<ServiceResponse<FlowExecutionLogDto>> InsertFlowExecutionLogAsync(FlowExecutionLogDto flowExecutionLogDto);

    /// <summary>
    /// Updates a flow execution log
    /// </summary>
    /// <param name="flowExecutionLogDto">Flow Execution Log Dto</param>
    /// <returns>An updated execution log</returns>
    Task<ServiceResponse<FlowExecutionLogDto>> UpdateFlowExecutionLogAsync(FlowExecutionLogDto flowExecutionLogDto);

    /// <summary>
    /// Deletes a flow execution log
    /// </summary>
    /// <param name="id">Log Id</param>
    /// <returns>True, if delete job successful, else false</returns>
    Task<ServiceResponse<bool>> DeleteFlowExecutionLogAsync(Guid id);
}