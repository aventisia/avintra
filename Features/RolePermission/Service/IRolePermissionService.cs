namespace  AccountsAPIs.Services;

public interface IRolePermissionService
{
    /// <summary>
    /// Get a list of role permissions
    /// </summary>
    /// <returns>List of role permissions</returns>
    Task<ServiceResponse<IEnumerable<RolePermissionDto>>> GetRolePermissionListAsync();

    /// <summary>
    /// Inserts a role permission
    /// </summary>
    /// <param name="rolePermissionDto">Role Permission Dto</param>
    /// <returns>A new role permission</returns>
    Task<ServiceResponse<RolePermissionDto>> InsertRolePermissionAsync(RolePermissionDto rolePermissionDto);

    /// <summary>
    /// Updates a role permission
    /// </summary>
    /// <param name="rolePermissionDto">Role Permission Dto</param>
    /// <returns>An updated role permission</returns>
    Task<ServiceResponse<RolePermissionDto>> UpdateRolePermissionAsync(RolePermissionDto rolePermissionDto);

    /// <summary>
    /// Deletes a role permission
    /// </summary>
    /// <param name="id">Id</param>
    /// <returns>True, if delete job is successful, else false</returns>
    Task<ServiceResponse<bool>> DeleteRolePermissionAsync(Guid id);
}