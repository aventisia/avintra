namespace WorkspaceAPIs.Services;

/// <summary>
/// Provides operations to manage users assigned to flow versions.
/// </summary>
public interface IFlowVersionUserService
{
    /// <summary>
    /// Gets flow version users for the current user (optionally filtered by flow version).
    /// </summary>
    /// <returns>List of flow version users.</returns>
    Task<ServiceResponse<IEnumerable<FlowVersionUserDto>>> GetMyFlowVersionsAsync();

    /// <summary>
    /// Gets all users assigned to a specific flow version.
    /// </summary>
    /// <param name="flowVersionId">The flow version ID.</param>
    /// <returns>List of flow version users.</returns>
    Task<ServiceResponse<IEnumerable<FlowVersionUserDto>>> GetFlowVersionUsersAsync(Guid flowVersionId);

    /// <summary>
    /// Gets a flow version user by ID.
    /// </summary>
    /// <param name="flowVersionUserId">The flow version user ID.</param>
    /// <returns>The flow version user details.</returns>
    Task<ServiceResponse<FlowVersionUserDto>> GetFlowVersionUserByIdAsync(Guid flowVersionUserId);

    /// <summary>
    /// Creates a new flow version user.
    /// </summary>
    /// <param name="flowVersionUserDto">The flow version user data.</param>
    /// <returns>The created flow version user.</returns>
    Task<ServiceResponse<FlowVersionUserDto>> InsertFlowVersionUserAsync(FlowVersionUserDto flowVersionUserDto);

    /// <summary>
    /// Creates multiple flow version users in a single operation.
    /// </summary>
    /// <param name="flowVersionUserDtos">List of flow version user data.</param>
    /// <returns>List of created flow version users.</returns>
    Task<ServiceResponse<IEnumerable<FlowVersionUserDto>>> BulkInsertFlowVersionUsersAsync(IEnumerable<FlowVersionUserDto> flowVersionUserDtos);

    /// <summary>
    /// Updates an existing flow version user.
    /// </summary>
    /// <param name="flowVersionUserDto">The updated flow version user data.</param>
    /// <returns>The updated flow version user.</returns>
    Task<ServiceResponse<FlowVersionUserDto>> UpdateFlowVersionUserAsync(FlowVersionUserDto flowVersionUserDto);

    /// <summary>
    /// Deletes a flow version user by ID.
    /// </summary>
    /// <param name="flowVersionUserId">The flow version user ID.</param>
    /// <returns>True if deleted successfully; otherwise false.</returns>
    Task<ServiceResponse<bool>> DeleteFlowVersionUserAsync(Guid flowVersionUserId);

    /// <summary>
    /// Deletes multiple flow version users.
    /// </summary>
    /// <param name="flowVersionUserIds">List of flow version user IDs.</param>
    /// <returns>True if all users were deleted successfully; otherwise false.</returns>
    Task<ServiceResponse<bool>> DeleteFlowVersionUsersAsync(IEnumerable<Guid> flowVersionUserIds);
}