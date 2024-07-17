namespace AccountsAPIs.Services;

/// <summary>
/// Represents a service for creating new accounts for individual users (IU) or Aventisia employees.
/// </summary>
public interface ICreateAccountService
{
    /// <summary>
    /// Creates a new account for an individual user (IU) or Aventisia employee.
    /// </summary>
    /// <param name="createAccountDto">The data transfer object containing the account information.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a service response with the created account user.</returns>
    Task<ServiceResponse<AccountUser>> CreateAccountAsync(CreateAccountDto createAccountDto);
}