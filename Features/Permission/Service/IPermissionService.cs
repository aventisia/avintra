namespace  AccountsAPIs.Services;

public interface IPermissionService
{
    /// <summary>
    /// Get a list of permissions
    /// </summary>
    /// <returns>List of permissions</returns>
    Task<ServiceResponse<IEnumerable<PermissionDto>>> GetPermissionListAsync();

    /// <summary>
    /// Inserts a permission
    /// </summary>
    /// <param name="permissionDto">Permission Dto</param>
    /// <returns>A new permission</returns>
    Task<ServiceResponse<PermissionDto>> InsertPermissionAsync(PermissionDto permissionDto);

    /// <summary>
    /// Updates a permission
    /// </summary>
    /// <param name="permissionDto">Permission Dto</param>
    /// <returns>An updated permission</returns>
    Task<ServiceResponse<PermissionDto>> UpdatePermissionAsync(PermissionDto permissionDto);

    /// <summary>
    /// Deletes a permission
    /// </summary>
    /// <param name="id">Id</param>
    /// <returns>True, if delete job is successful, else false</returns>
    Task<ServiceResponse<bool>> DeletePermissionAsync(Guid id);

    Task<HashSet<string>> GetPermissionsAsync(Guid userId);
}