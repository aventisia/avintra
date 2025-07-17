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

    /// <summary>
    /// Retrieves a list of publish flow versions, optionally including unpublished agents.
    /// </summary>
    /// <param name="includeUnpublished"> A flag indicating whether to include unpublished agents in the result. Defaults to <c>false</c>. </param>
    /// <returns> A <see cref="Task"/> representing the asynchronous operation, with a result of a <see cref="ServiceResponse{T}"/> containing a list of publish flow versions.
    /// </returns>
    Task<ServiceResponse<IEnumerable<FlowAgentTableDto>>> GetPublishedFlowVersionsAsync(bool includeUnpublished = false);

    /// <summary>
    /// Searches and retrieves a list of flow versions based on the search key, optionally including unpublished flow versions.
    /// </summary>
    /// <param name="searchKey"> A string used to filter the flows by name. If the searchKey is null or empty, all flows will be considered.</param>
    /// <param name="includeUnpublished"> A flag indicating whether to include unpublished flow versions in the result. Defaults to <c>false</c>. </param>
    /// <returns>
    /// A <see cref="Task"/> representing the asynchronous operation, with a result of a <see cref="ServiceResponse{T}"/> containing a list of flow versions (published or unpublished) that match the search criteria.
    /// </returns>
    Task<ServiceResponse<IEnumerable<FlowAgentTableDto>>> SearchFlowVersionsAsync(string searchKey, bool includeUnpublished = false);
}