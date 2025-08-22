namespace AccountsAPIs.Services;

/// <summary>
/// Service interface for handling user registration and updates.
/// </summary>
public interface IUserRegistrationService
{
    /// <summary>
    /// Creates a new account for an individual user (IU) or Aventisia employee.
    /// </summary>
    /// <param name="createAccountDto">The data transfer object containing the account information.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a service response with the created account user.</returns>
    Task<ServiceResponse<AccountUser>> CreateAccountAsync(CreateAccountDto createAccountDto);

    /// <summary>
    /// Updates the tenant organization details.
    /// </summary>
    /// <param name="tenantOrganizationDto">Contains the updated organization details for the tenant.</param>
    /// <returns>
    /// A task representing the operation, returning a <see cref="ServiceResponse{AccountUsersTableDto}"/> with the outcome.
    /// </returns>
    Task<ServiceResponse<AccountUser>> UpdateTenantOrganizationAsync(TenantOrganizationDto tenantOrganizationDto);
}
