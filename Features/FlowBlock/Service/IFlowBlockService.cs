namespace WorkspaceAPIs.Services;

public interface IFlowBlockService
{
    /// <summary>
    /// Retrieves a collection of flow blocks associated with the specified reference ID, 
    /// which may represent either a Flow ID or a Tenant ID.
    /// </summary>
    /// <param name="refId">The reference ID, which can be a Flow ID or a Tenant ID.</param>
    /// <returns>A service response containing a list of flow blocks linked to the given refId.</returns>
    Task<ServiceResponse<IEnumerable<FlowBlockDto>>> GetFlowBlocksByIdAsync(Guid? refId);

    /// <summary>
    /// Retrieves a specific flow block by its unique identifier.
    /// </summary>
    /// <param name="flowBlockId">The unique identifier of the flow block</param>
    /// <returns>A service response containing the FlowBlockDto if found, otherwise null</returns>
    Task<ServiceResponse<FlowBlockDto>> GetFlowBlockByIdAsync(Guid flowBlockId);

    /// <summary>
    /// Adds a new flow block to a flow.
    /// </summary>
    /// <param name="flowBlockDto">The data representing the flow block to be added</param>
    /// <returns>A service response containing the newly added flow block</returns>
    Task<ServiceResponse<FlowBlockDto>> InsertFlowBlockAsync(FlowBlockDto flowBlockDto);

    /// <summary>
    /// Updates the information of an existing flow block.
    /// </summary>
    /// <param name="flowBlockDto">The data of the flow block to be updated</param>
    /// <returns>A service response containing the updated flow block</returns>
    Task<ServiceResponse<FlowBlockDto>> UpdateFlowBlockAsync(FlowBlockDto flowBlockDto);

    /// <summary>
    /// Removes a flow block permanently.
    /// </summary>
    /// <param name="flowBlockId">The unique identifier of the flow block to be deleted</param>
    /// <returns>A service response indicating whether the delete operation was successful</returns>
    Task<ServiceResponse<bool>> DeleteFlowBlockAsync(Guid flowBlockId);

    /// <summary>
    /// Removes multiple flow blocks based on a list of unique identifiers.
    /// </summary>
    /// <param name="flowBlockIds">A collection of GUIDs representing the flow blocks to be removed</param>
    /// <returns>A service response indicating whether the delete operation was successful</returns>
    Task<ServiceResponse<bool>> DeleteMultipleFlowBlocksAsync(IEnumerable<Guid> flowBlockIds);
}
