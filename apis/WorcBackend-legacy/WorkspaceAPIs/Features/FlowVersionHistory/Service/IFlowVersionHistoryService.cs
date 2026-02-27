namespace WorkspaceAPIs.Services;

public interface IFlowVersionHistoryService
{
    /// <summary>
    /// Retrieves all flow version history records for a specific flow version.
    /// </summary>
    /// <param name="flowVersionId">The identifier of the flow version to fetch history for.</param>
    /// <returns>A <see cref="ServiceResponse{T}"/> containing a collection of flow version history DTOs.</returns>
    Task<ServiceResponse<IEnumerable<FlowVersionHistoryDto>>> GetAllAsync(Guid flowVersionId);

    /// <summary>
    /// Retrieves a single flow version history deatil by its unique identifier.
    /// </summary>
    /// <param name="flowVersionHistoryId">The unique identifier of the flow version history record.</param>
    /// <returns>A <see cref="ServiceResponse{T}"/> containing the flow version history DTO if found.</returns>
    Task<ServiceResponse<FlowVersionHistoryDetailDto>> GetByIdAsync(Guid flowVersionHistoryId);

    /// <summary>
    /// Creates a new flow version history record.
    /// </summary>
    /// <param name="flowVersionHistoryDto">The flow version history DTO representing the record to create.</param>
    /// <returns>A <see cref="ServiceResponse{T}"/> containing the newly created flow version history DTO.</returns>
    Task<ServiceResponse<FlowVersionHistoryDto>> InsertAsync(FlowVersionHistoryDto flowVersionHistoryDto);

    /// <summary>
    /// Updates an existing flow version history record.
    /// </summary>
    /// <param name="flowVersionHistoryDto">The flow version history DTO with updated values.</param>
    /// <returns>A <see cref="ServiceResponse{T}"/> containing the updated flow version history DTO.</returns>
    Task<ServiceResponse<FlowVersionHistoryDto>> UpdateAsync(FlowVersionHistoryDto flowVersionHistoryDto);

    /// <summary>
    /// Deletes a flow version history record by its unique identifier.
    /// </summary>
    /// <param name="flowVersionHistoryId">The unique identifier of the record to delete.</param>
    /// <returns>A <see cref="ServiceResponse{T}"/> indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteByIdAsync(Guid flowVersionHistoryId);

    /// <summary>
    /// Deletes multiple flow version history records by their unique identifiers.
    /// </summary>
    /// <param name="flowVersionHistoryIds">A collection of unique identifiers of the records to delete.</param>
    /// <returns>A <see cref="ServiceResponse{T}"/> indicating whether the deletions were successful.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleAsync(IEnumerable<Guid> flowVersionHistoryIds);

    /// <summary>
    /// Creates a history record for the flow version if the ReactFlow JSON has been modified.
    /// </summary>
    /// <param name="flowVersion">The existing flow version entity to compare against.</param>
    /// <param name="flowSilentUpdateDto">The DTO containing the updated ReactFlow JSON.</param>
    /// <returns>
    /// A <see cref="ServiceResponse{T}"/> indicating whether a new history record was successfully created.
    /// </returns>
    Task<ServiceResponse<bool>> CreateHistoryIfReactFlowChangedAsync(FlowVersion flowVersion, FlowSilentUpdateDto flowSilentUpdateDto);

    /// <summary>
    /// Creates a flow version history record by cloning a flow.
    /// </summary>
    /// <param name="flowVersionHistoryDto">The flow version history DTO representing the record to create.</param>
    /// <returns>A <see cref="ServiceResponse{T}"/> containing the newly created flow version history DTO.</returns>
    Task<ServiceResponse<FlowVersionHistoryDto>> CloneFlowAsync(FlowVersionHistoryDto flowVersionHistoryDto);

    /// <summary>
    /// Creates a flow version history record by cloning a specific flow version.
    /// </summary>
    /// <param name="flowVersionHistoryDto">The flow version history DTO representing the record to create.</param>
    /// <returns>A <see cref="ServiceResponse{T}"/> containing the newly created flow version history DTO.</returns>
    Task<ServiceResponse<FlowVersionHistoryDto>> CloneFlowVersionAsync(FlowVersionHistoryDto flowVersionHistoryDto);
}