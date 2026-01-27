namespace AccountsAPIs.Services;

public interface ILoginWithExternalAuthService
{
    /// <summary>
    /// Generates a login URL for the specified external authentication provider.
    /// </summary>
    /// <param name="type">The external authentication provider (e.g., Azure, Google, Facebook, Twitter).</param>
    /// <returns>The generated login URL or an error message.</returns>
    ServiceResponse<string> GenerateLoginUrlAsync(ExternalAuthProviderEnum type);

    // /// <summary>
    // /// Validates the external authentication token and creates or retrieves the user.
    // /// </summary>
    // /// <param name="validateTokenRequestDto">Contains the provider information and token to validate.</param>
    // /// <returns>A task that represents the asynchronous operation. The task result contains the service response with the authenticated or created user information.</returns>
    // Task<ServiceResponse<AccountUser>> ValidateTokenAndCreateUserAsync(ValidateTokenRequestDto validateTokenRequestDto);

    /// <summary>
    /// Handles the Azure Entra login callback and processes the authorization code.
    /// </summary>
    /// <param name="code">The authorization code returned by Azure Entra.</param>
    /// <returns>The service response with the authenticated user.</returns>
    Task<ServiceResponse<AccountUser>> EntraCallbackAsync(string code);
}
