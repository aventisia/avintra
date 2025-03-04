namespace WorkspaceAPIs.Services;
public interface IFlowVersionService
{
    /// <summary>
    /// Get a list of flow versions of a flow using flow identifier
    /// </summary>
    /// <param name="flowId">Flow Id</param>
    /// <returns>A list of flow versions</returns>
    Task<ServiceResponse<IEnumerable<FlowVersionDto>>> GetFlowVersionsAsync(Guid flowId);

    /// <summary>
    /// Creates a new flow version
    /// </summary>
    /// <param name="flowVersionDto">Flow version dto</param>
    /// <returns>A newly created flow version</returns>
    Task<ServiceResponse<FlowVersionDto>> InsertFlowVersionAsync(FlowVersionDto flowVersionDto);

    /// <summary>
    /// Updates a new flow version
    /// </summary>
    /// <param name="flowVersionDto">Flow version dto</param>
    /// <returns>An updated flow version</returns>
    Task<ServiceResponse<FlowVersionDto>> UpdateFlowVersionAsync(FlowVersionDto flowVersionDto);

    /// <summary>
    /// Deletes a flow version
    /// </summary>
    /// <param name="id">Version Id</param>
    /// <returns>True, if delete job successful, else false</returns>
    Task<ServiceResponse<bool>> DeleteFlowVersionAsync(Guid id);
}