namespace  AccountsAPIs.Services;

public interface ICustomRoleService
{
    /// <summary>
    /// Get a list of custom roles
    /// </summary>
    /// <returns>List of roles</returns>
    Task<ServiceResponse<IEnumerable<CustomRoleDto>>> GetCustomRoleListAsync();

    /// <summary>
    /// Inserts a role
    /// </summary>
    /// <param name="customRoleDto">CustomRole DTO</param>
    /// <returns>A new role</returns>
    Task<ServiceResponse<CustomRoleDto>> InsertCustomRoleAsync(CustomRoleDto customRoleDto);

    /// <summary>
    /// Updates a role
    /// </summary>
    /// <param name="customRoleDto">CustomRole DTO</param>
    /// <returns>An updated role</returns>
    Task<ServiceResponse<CustomRoleDto>> UpdateCustomRoleAsync(CustomRoleDto customRoleDto);

    /// <summary>
    /// Deletes a role
    /// </summary>
    /// <param name="id">Id</param>
    /// <returns>True, if delete job is successful, else false</returns>
    Task<ServiceResponse<bool>> DeleteCustomeRoleAsync(Guid id);
}