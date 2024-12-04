namespace WorkspaceAPIs.Services;
/// <summary>
/// Represents a service for managing flow log.
/// </summary>
public interface IFlowLogService
{
    /// <summary>
    /// Inserts a new flow.
    /// </summary>
    /// <param name="FlowLogDto">The data required to insert the flow.</param>
    /// <returns>The task result contains the service response with the inserted flow details.</returns>
   
    Task<ServiceResponse<FlowLogDto>> CreateFlowLogAsync (FlowLogDto flowLogDto);

    ///<summary>
    /// Update flow log 
    ///</summary>
    ///<param name="FlowLogDto">The data required to update the flow log.</param>
    /// <returns>The task result contains the service response with the updated flow log details.</returns>

    Task<ServiceResponse<FlowLogDto>> UpdateFlowLogAsync (FlowLogDto flowLogDto);


}