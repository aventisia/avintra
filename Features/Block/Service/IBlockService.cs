namespace WorkspaceAPIs.Services;

public interface IBlockService
{
    /// <summary>
    /// Retrieves a collection of flow versions associated with the specified flowId.
    /// </summary>
    /// <param name="flowId">The reference Flow ID.</param>
    /// <returns>A service response containing a list of flow versions linked to the given flowId.</returns>
    Task<ServiceResponse<IEnumerable<FlowVersionDto>>> GetBlocksByIdAsync(Guid? flowId);

    /// <summary>
    /// Retrieves a specific flow version by its unique identifier.
    /// </summary>
    /// <param name="flowVersionId">The unique identifier of the flow version.</param>
    /// <returns>A service response containing the FlowVersionDto if found, otherwise null.</returns>
    Task<ServiceResponse<FlowVersionDto>> GetBlockByIdAsync(Guid flowVersionId);

    /// <summary>
    /// Adds a new flow version to a flow.
    /// </summary>
    /// <param name="blockDto">The data representing the flow version to be added.</param>
    /// <returns>A service response containing the newly added flow version.</returns>
    Task<ServiceResponse<FlowVersionDto>> InsertBlockAsync(BlockDto blockDto);

    /// <summary>
    /// Updates the information of an existing flow version.
    /// </summary>
    /// <param name="blockDto">The data of the flow version to be updated.</param>
    /// <returns>A service response containing the updated flow version.</returns>
    Task<ServiceResponse<FlowVersionDto>> UpdateBlockAsync(BlockDto blockDto);

    /// <summary>
    /// Removes a flow version permanently.
    /// </summary>
    /// <param name="flowVersionId">The unique identifier of the flow version to be deleted.</param>
    /// <returns>A service response indicating whether the delete operation was successful.</returns>
    Task<ServiceResponse<bool>> DeleteBlockAsync(Guid flowVersionId);

    /// <summary>
    /// Removes multiple flow versions based on a list of unique identifiers.
    /// </summary>
    /// <param name="flowVersionIds">A collection of GUIDs representing the flow versions to be removed.</param>
    /// <returns>A service response indicating whether the delete operation was successful.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleBlocksAsync(IEnumerable<Guid> flowVersionIds);

    /// <summary>
    /// Searches for flow versions based on a search key and optional flow ID.
    /// </summary>
    /// <param name="searchKey">The keyword used to search flow names. The search is case-insensitive.</param>
    /// <param name="flowId">An optional flow identifier. If provided, the search will only return flow versions linked to this flow.</param>
    /// <returns>A service response containing a collection of <see cref="SearchBlockDto"/> objects matching the search criteria.</returns>
    /// <remarks>
    /// This method retrieves flow versions based on the provided search key and applies access control logic based on user permissions.
    /// </remarks>
    Task<ServiceResponse<IEnumerable<SearchBlockDto>>> SearchBlocksAsync(string searchKey, Guid? flowId);
}
