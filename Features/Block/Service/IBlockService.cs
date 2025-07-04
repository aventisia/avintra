namespace WorkspaceAPIs.Services;

public interface IBlockService
{
    /// <summary>
    /// Retrieves a collection of blocks associated with the specified flowVersionId.
    /// </summary>
    /// <param name="flowVersionId">The reference Flow Version ID.</param>
    /// <returns>A service response containing a list of blocks linked to the given flowVersionId.</returns>
    Task<ServiceResponse<IEnumerable<BlockDto>>> GetBlocksByIdAsync(Guid? flowVersionId);

    /// <summary>
    /// Retrieves a specific block by its unique identifier.
    /// </summary>
    /// <param name="blockId">The unique identifier of the block.</param>
    /// <returns>A service response containing the BlockDto if found, otherwise null.</returns>
    Task<ServiceResponse<BlockDto>> GetBlockByIdAsync(Guid blockId);

    /// <summary>
    /// Adds a new block to a flow version.
    /// </summary>
    /// <param name="blockDto">The data representing the block to be added.</param>
    /// <returns>A service response containing the newly added block.</returns>
    Task<ServiceResponse<BlockDto>> InsertBlockAsync(BlockDto blockDto);

    /// <summary>
    /// Updates the information of an existing block.
    /// </summary>
    /// <param name="blockDto">The data of the block to be updated.</param>
    /// <returns>A service response containing the updated block.</returns>
    Task<ServiceResponse<BlockDto>> UpdateBlockAsync(BlockDto blockDto);

    /// <summary>
    /// Removes a block permanently.
    /// </summary>
    /// <param name="blockId">The unique identifier of the block to be deleted.</param>
    /// <returns>A service response indicating whether the delete operation was successful.</returns>
    Task<ServiceResponse<bool>> DeleteBlockAsync(Guid blockId);

    /// <summary>
    /// Removes multiple blocks based on a list of unique identifiers.
    /// </summary>
    /// <param name="blockIds">A collection of GUIDs representing the blocks to be removed.</param>
    /// <returns>A service response indicating whether the delete operation was successful.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleBlocksAsync(IEnumerable<Guid> blockIds);
}
