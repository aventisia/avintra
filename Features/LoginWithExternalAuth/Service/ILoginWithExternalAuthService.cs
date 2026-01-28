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
    /// Processes the Azure Entra login and handles the provided authorization code.
    /// </summary>
    /// <param name="code">The authorization code received from Azure Entra.</param>
    /// <returns>A service response containing the authenticated user account information.</returns>
    Task<ServiceResponse<AccountUser>> EntraTokenAsync(string code);
}
