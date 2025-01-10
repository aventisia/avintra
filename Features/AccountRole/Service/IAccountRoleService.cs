namespace  AccountsAPIs.Services;

public interface IAccountRoleService
{
    /// <summary>
    /// Get a list of account roles
    /// </summary>
    /// <returns>List of roles</returns>
    Task<ServiceResponse<IEnumerable<AccountRoleDto>>> GetAccountRoleListAsync();

    /// <summary>
    /// Inserts a role
    /// </summary>
    /// <param name="accountRoleDto">Account Role Dto</param>
    /// <returns>A new role</returns>
    Task<ServiceResponse<AccountRoleDto>> InsertAccountRoleAsync(AccountRoleDto accountRoleDto);

    /// <summary>
    /// Updates a role
    /// </summary>
    /// <param name="accountRoleDto">Account Role Dto</param>
    /// <returns>An updated role</returns>
    Task<ServiceResponse<AccountRoleDto>> UpdateAccountRoleAsync(AccountRoleDto accountRoleDto);

    /// <summary>
    /// Deletes a role
    /// </summary>
    /// <param name="id">Id</param>
    /// <returns>True, if delete job is successful, else false</returns>
    Task<ServiceResponse<bool>> DeleteAccountRoleAsync(Guid id);
}