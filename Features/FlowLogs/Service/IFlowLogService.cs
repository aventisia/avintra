namespace WorkspaceAPIs.Services;
/// <summary>
/// Represents a service for managing flow log.
/// </summary>
public interface IFlowLogService
{
    /// <summary>
    /// get flow log Record.
    /// </summary>
    /// <param name="FlowLogDto">The data required to insert the flow.</param>
    /// <returns>The task result contains the service response with the inserted flow details.</returns>

    Task<ServiceResponse<IEnumerable<FlowLogDto>>> GetFlowLogAsync(Guid flowId);

    /// <summary>
    /// Inserts a new flow.
    /// </summary>
    /// <param name="FlowLogDto">The data required to insert the flow.</param>
    /// <returns>The task result contains the service response with the inserted flow details.</returns>
   
    Task<ServiceResponse<FlowLogDto>> CreateFlowLogAsync(FlowLogDto flowLogDto);

    ///<summary>
    /// Update flow log 
    ///</summary>
    ///<param name="FlowLogDto">The data required to update the flow log.</param>
    /// <returns>The task result contains the service response with the updated flow log details.</returns>

    Task<ServiceResponse<FlowLogDto>> UpdateFlowLogAsync (FlowLogDto flowLogDto);

    /// <summary>
    /// Deletes flow log permanently
    /// </summary>
    /// <param name="id">Flow comment Id (Primary Key)</param>
    /// <returns>True if delete job is successful, else false</returns>

    Task<ServiceResponse<bool>> DeleteFlowLogAsync(Guid id);
}