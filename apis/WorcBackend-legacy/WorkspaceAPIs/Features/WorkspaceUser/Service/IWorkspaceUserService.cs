namespace WorkspaceAPIs.Services;

/// <summary>
/// Represents a service for managing workspace users.
/// </summary>
public interface IWorkspaceUserService
{
    /// <summary>
    /// Retrieves a workspace user by its ID.
    /// </summary>
    /// <param name="id">The ID of the workspace user.</param>
    /// <returns>The task result contains the retrieved workspace user.</returns>
    Task<ServiceResponse<WorkspaceUserDto>> GetWorkspaceUserAsync(Guid id);

    // Get records is not required for WorksapceUser as other than user itself, 
    // no one required to see all users from InternalUser entity. Tenant manager 
    // will be able to see all users from AccountUser entity.

    /// <summary>
    /// Insert new workspace record if does not exist already
    /// </summary>
    /// <param name="workspaceUserDto">The data for the new workspace user.</param>
    /// <returns>The task result contains the inserted workspace user.</returns>
    Task<ServiceResponse<WorkspaceUserDto>> InsertWorkspaceUserAsync(WorkspaceUserDto workspaceUserDto);

    /// <summary>
    /// Updates an existing workspace user.
    /// </summary>
    /// <param name="workspaceUserDto">The updated data for the workspace user.</param>
    /// <returns>The task result contains the updated workspace user.</returns>
    Task<ServiceResponse<WorkspaceUserDto>> UpdateWorkspaceUserAsync(WorkspaceUserDto workspaceUserDto);

    /// <summary>
    /// Deletes a workspace user by its ID.
    /// </summary>
    /// <param name="id">The ID of the workspace user to delete.</param>
    /// <returns>The task result contains a boolean indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteWorkspaceUserAsync(Guid id);
}
