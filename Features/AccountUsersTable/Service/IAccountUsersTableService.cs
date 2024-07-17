namespace AccountsAPIs.Services;

/// <summary>
/// Represents a service for managing account users. Autherized roles: SA,GA,GSA,TA,TSA 
/// </summary>
/// <remarks>
/// Note: User cannot manange default records, their own record and all those records whoes roles cannot be changed by the user
/// </remarks>
public interface IAccountUsersTableService
{
    /// <summary>
    /// Retrieves a list of account users.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation. The task result contains the service response with the list of account users.</returns>
    Task<ServiceResponse<IEnumerable<AccountUsersTableDto>>> GetAccountUsersAsync();

    /// <summary>
    /// Inserts a new account user.
    /// </summary>
    /// <param name="accountUsersTableDto">The account user DTO.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the service response with the inserted account user DTO.</returns>
    Task<ServiceResponse<AccountUsersTableDto>> InsertAccountUserAsync(AccountUsersTableDto accountUsersTableDto);

    /// <summary>
    /// Updates an account user.
    /// </summary>
    /// <param name="accountUsersTableDto">The account user DTO containing the updated information.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the service response with the updated account user DTO.</returns>
    Task<ServiceResponse<AccountUsersTableDto>> UpdateAccountUserAsync(AccountUsersTableDto accountUsersTableDto);

    /// <summary>
    /// Deletes an account user.
    /// </summary>
    /// <param name="id">The ID of the account user to delete.</param>
    /// <returns>A task representing the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> indicating the success or failure of the operation.</returns>
    Task<ServiceResponse<bool>> DeleteAccountUserAsync(Guid id);

    /// <summary>
    /// Retrieves the account roles basis current user top role. <br/>
    /// </summary>
    /// <remarks>
    /// Note: GLBA, TLBA, TU, AE, IU will have no access to user management on gloabl or tenant level
    /// </remarks>
    /// <returns>A task that represents the asynchronous operation. The task result contains the service response with a collection of select option DTOs.</returns>
    Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetAccountRolesAsync();

    /// <summary>
    /// Updates the roles of an account user. Removes unassinged ones and add new ones if there is any requirement
    /// </summary>
    /// <param name="accountUser">The account user to update.</param>
    /// <param name="rolesToUpdate">The list of roles to update.</param>
    /// <returns>A task representing the asynchronous operation. The task result is a boolean indicating whether the update was successful.</returns>
    Task<bool> UpdateAccountUserRoles(AccountUser accountUser, List<string> rolesToUpdate);
}