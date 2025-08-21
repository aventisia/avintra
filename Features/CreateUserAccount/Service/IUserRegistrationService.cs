namespace AccountsAPIs.Services;

/// <summary>
/// Service interface for handling user registration and updates.
/// </summary>
public interface IUserRegistrationService
{
    /// <summary>
    /// Registers a new user or employee by creating their account.
    /// </summary>
    /// <param name="createUserAccountDto">Contains the registration details of the user.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The result contains a <see cref="ServiceResponse{AccountUsersTableDto}"/> with the outcome.
    /// </returns>
    Task<ServiceResponse<AccountUsersTableDto>> RegisterUserAsync(CreateUserAccountDto createUserAccountDto);

    /// <summary>
    /// Updates the tenant organization details.
    /// </summary>
    /// <param name="tenantOrganizationDto">Contains the updated organization details for the tenant.</param>
    /// <returns>
    /// A task representing the operation, returning a <see cref="ServiceResponse{AccountUsersTableDto}"/> with the outcome.
    /// </returns>
    Task<ServiceResponse<AccountUsersTableDto>> UpdateTenantOrganizationAsync(TenantOrganizationDto tenantOrganizationDto);

    /// <summary>
    /// Updates user information such as name and password.
    /// </summary>
    /// <param name="updateUserInformationDto">Contains the user's updated details.</param>
    /// <returns>
    /// A service response with the updated <see cref="AccountUser"/> or an error message if the operation fails.
    /// </returns>
    Task<ServiceResponse<AccountUser>> UpdateUserInformationAsync(UpdateUserInformationDto updateUserInformationDto);
}
