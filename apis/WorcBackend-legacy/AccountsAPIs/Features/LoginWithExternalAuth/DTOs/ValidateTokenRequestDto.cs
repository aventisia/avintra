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
}
