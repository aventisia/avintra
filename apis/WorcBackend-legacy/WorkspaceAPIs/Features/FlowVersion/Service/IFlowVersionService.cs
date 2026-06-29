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
    /// Updates the execution settings for the specified flow version.
    /// </summary>
    /// <param name="flowVersionId">The unique identifier of the flow version.</param>
    /// <param name="executionSettings">The execution settings to apply.</param>
    /// <returns>The updated flow version.</returns>
    Task<ServiceResponse<bool>> UpdateFlowVersionSettingsAsync(Guid flowVersionId, [FromBody] ExecutionSettings executionSettings);

    /// <summary>
    /// Deletes a flow version
    /// </summary>
    /// <param name="id">Version Id</param>
    /// <returns>True, if delete job successful, else false</returns>
    Task<ServiceResponse<bool>> DeleteFlowVersionAsync(Guid id);

    /// <summary>
    /// Searches and retrieves a list of flow versions based on the search key, flow type, and publication status.
    /// The search key is used to filter the flows by name and version. If the searchKey is null or empty, all flows will be considered.
    /// The flow type is used to filter the flows by their type (e.g., Agent, Workflow, etc.). If not specified, it defaults to Agent type flows.
    /// The includeUnpublished flag indicates whether to include unpublished flow versions in the result. It defaults to true, meaning only published flow versions will be included unless specified otherwise.
    /// </summary>
    /// <param name="searchFlowVersionReqDto"> A DTO containing the search criteria for flow versions. </param>
    /// <returns>
    /// A <see cref="Task"/> representing the asynchronous operation, with a result of a <see cref="ServiceResponse{T}"/> containing a list of flow versions that match the search criteria.
    /// </returns>
    Task<ServiceResponse<IEnumerable<SearchFlowVersionResDto>>> SearchFlowVersionsAsync(SearchFlowVersionReqDto searchFlowVersionReqDto);
}