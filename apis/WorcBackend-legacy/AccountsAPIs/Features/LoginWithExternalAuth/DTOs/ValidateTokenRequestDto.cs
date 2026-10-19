namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the data transfer object for validating an external authentication token and handling login.
/// </summary>
public class ValidateTokenRequestDto
{
    /// <summary>
    /// Gets or sets the authentication token received from the external provider.
    /// </summary>
    public required string Token { get; set; }

    /// <summary>
    /// Gets or sets the authentication provider used for login (e.g., 'Azure', 'Google', 'Facebook').
    /// </summary>
    public ExternalAuthProviderEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the client id the token was issued to. Required for Azure Entra audience validation.
    /// </summary>
    public string? ClientId { get; set; }

    /// <summary>
    /// Gets or sets the single-use OAuth state bound to this authorization attempt.
    /// </summary>
    public SsoAuthStateDto? AuthState { get; set; }

    /// <summary>
    /// Gets or sets the domain-matched single sign-on tenant for just-in-time provisioning.
    /// </summary>
    public Guid? SsoTenantId { get; set; }
}
