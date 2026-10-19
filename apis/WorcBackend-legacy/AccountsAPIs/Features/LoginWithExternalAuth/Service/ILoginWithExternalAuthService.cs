namespace AccountsAPIs.Services;

public interface ILoginWithExternalAuthService
{
    /// <summary>
    /// Generates a login URL for the specified external authentication provider.
    /// </summary>
    /// <param name="type">The external authentication provider (e.g., Azure, Google, Facebook, Twitter).</param>
    /// <returns>The generated login URL or an error message.</returns>
    ServiceResponse<string> GenerateLoginUrlAsync(ExternalAuthProviderEnum type);

    /// <summary>
    /// Generates a login URL carrying the email hint and the OAuth state binding for a specific tenant.
    /// </summary>
    /// <param name="type">The external authentication provider.</param>
    /// <param name="email">The email used as the provider login hint.</param>
    /// <param name="tenantId">The tenant the authorization attempt belongs to.</param>
    /// <param name="clientId">The client id to use, or null to use the global application.</param>
    /// <returns>The generated login URL or an error message.</returns>
    ServiceResponse<string> GenerateLoginUrlAsync(ExternalAuthProviderEnum type, string? email, Guid tenantId, string? clientId);

    /// <summary>
    /// Generates an administrator consent URL that binds the granted tenant id to the supplied tenant.
    /// </summary>
    /// <param name="email">The email used as the provider login hint.</param>
    /// <param name="tenantId">The tenant the consent grant belongs to.</param>
    /// <param name="clientId">The client id to use, or null to use the global application.</param>
    /// <returns>The generated consent URL or an error message.</returns>
    ServiceResponse<string> GenerateAdminConsentUrlAsync(string? email, Guid tenantId, string? clientId);

    /// <summary>
    /// Consumes the single-use OAuth state created while generating an authorization URL.
    /// </summary>
    /// <param name="state">The opaque state returned by the provider.</param>
    /// <returns>The bound state, or null when the state is unknown, expired or already used.</returns>
    SsoAuthStateDto? ConsumeAuthState(string? state);

    /// <summary>
    /// Processes the Azure Entra login and handles the provided authorization code.
    /// </summary>
    /// <param name="code">The authorization code received from Azure Entra.</param>
    /// <param name="state">The OAuth state returned by Azure Entra.</param>
    /// <returns>A service response containing the authenticated user account information.</returns>
    Task<ServiceResponse<AccountUser>> EntraTokenAsync(string code, string? state);
}
