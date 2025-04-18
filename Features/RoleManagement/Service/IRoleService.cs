namespace AccountsAPIs.Services;

public interface IRoleService
{
    /// <summary>
    /// Get a list of app roles
    /// </summary>
    /// <returns>List of roles</returns>
    Task<ServiceResponse<IEnumerable<RoleDto>>> GetRoleListAsync();

    /// <summary>
    /// Checks if a Role with the specified Name is available.
    /// </summary>
    /// <param name="checkAvailability">The DTO containing the Name to check.</param>
    /// <returns>A service response containing a DTO with the availability result and additional details.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsRoleAvailableAsync(CheckAvailabilityDto checkAvailability);

    /// <summary>
    /// Inserts a role
    /// </summary>
    /// <param name="roleDto">Account Role Dto</param>
    /// <returns>A new role</returns>
    Task<ServiceResponse<RoleDto>> InsertRoleAsync(RoleDto roleDto);

    /// <summary>
    /// Retrieve a role
    /// </summary>
    /// <param name="roleId">Id of the role</param>
    /// <returns>An retrieve role</returns>
    Task<ServiceResponse<RoleDto>> GetRoleByIdAsync(Guid roleId);

    /// <summary>
    /// Updates a role
    /// </summary>
    /// <param name="roleDto">Account Role Dto</param>
    /// <returns>An updated role</returns>
    Task<ServiceResponse<RoleDto>> UpdateRoleAsync(RoleDto roleDto);

    /// <summary>
    /// Deletes a role
    /// </summary>
    /// <param name="id">Id</param>
    /// <returns>True, if delete job is successful, else false</returns>
    Task<ServiceResponse<bool>> DeleteRoleAsync(Guid id);

    /// <summary>
    ///  Deletes an multiple Roles.
    /// </summary>
    /// <param name="roleIds">The ID of the Roles to delete.</param>
    /// <returns>A service response indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleRolesAsync(IEnumerable<Guid> roleIds);
}