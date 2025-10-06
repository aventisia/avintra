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
    /// Get a list of flow execution logs 
    /// </summary>
    /// <param name="flowExecutionLogDto">Flow Execution Log Dto</param>
    /// <returns>A list of flow execution logs </returns>
    Task<ServiceResponse<IEnumerable<FlowExecutionLogDto>>> GetFlowExecutionLogListAsync();

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

     /// <summary>
    /// Deletes multiple flow execution log by their IDs.
    /// </summary>
    /// <param name="ids">The IDs of the flow execution log to delete.</param>
    /// <returns>The task result contains the service response indicating whether the flow execution log were successfully deleted.</returns>
    /// <remarks>
    /// It is recommended to use this method to delete multiple flow execution log at once to reduce the number of requests to the server.
    /// </remarks>
    Task<ServiceResponse<bool>> DeleteFLowExecutionLogListAsync(List<Guid> ids);
}