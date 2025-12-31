namespace WorkspaceAPIs.Services;

public interface IFlowUserService
{
    /// <summary>
    /// Retrieves a list of users associated with a specific flow, identified by the flow's Id.
    /// </summary>
    /// <param name="flowId">The unique identifier of the flow (Primary Key of Flow Entity)</param>
    /// <returns>A service response containing a list of users linked to the specified flowId</returns>
    Task<ServiceResponse<IEnumerable<FlowUserDto>>> GetFlowUsersByFlowIdAsync(Guid flowId);

    /// <summary>
    /// Retrieve a specific flow user by their unique identifier.
    /// </summary>
    /// <param name="flowUserId">The unique identifier of the flow user</param>
    /// <returns>A service response containing the FlowUserDto if the user is found, otherwise null</returns>
    Task<ServiceResponse<FlowUserDto>> GetFlowUserByIdAsync(Guid flowUserId);

    /// <summary>
    /// Adds a new user to a flow.
    /// </summary>
    /// <param name="flowUserDto">The data representing the user to be added to the flow</param>
    /// <returns>A service response containing the newly added flow user</returns>
    Task<ServiceResponse<FlowUserDto>> InsertFlowUserAsync(FlowUserDto flowUserDto);

    /// <summary>
    /// Updates the information of an existing flow user.
    /// </summary>
    /// <param name="flowUserDto">The data of the user to be updated</param>
    /// <returns>A service response containing the updated flow user</returns>
    Task<ServiceResponse<FlowUserDto>> UpdateFlowUserAsync(FlowUserDto flowUserDto);

    /// <summary>
    /// Removes a user from the flow permanently.
    /// </summary>
    /// <param name="flowUserId">The unique identifier of the flow user to be deleted</param>
    /// <returns>A service response indicating whether the delete operation was successful</returns>
    Task<ServiceResponse<bool>> DeleteFlowUserAsync(Guid flowUserId);

    /// <summary>
    /// Removes a user's access to the flow.
    /// </summary>
    /// <param name="flowId">The unique identifier of the flow whose access is to be removed</param>
    /// <returns>A service response indicating whether the access removal operation was successful</returns>
    Task<ServiceResponse<bool>> RemoveUserAccessFromFlowAsync(Guid flowId);

    /// <summary>
    /// Removes multiple users from the flow based on a list of unique identifiers.
    /// </summary>
    /// <param name="flowUserIds">A collection of GUIDs representing the flow users to be removed</param>
    /// <returns>A service response indicating whether the delete operation was successful</returns>
    Task<ServiceResponse<bool>> DeleteMultipleFlowUsersAsync(IEnumerable<Guid> flowUserIds);
}
