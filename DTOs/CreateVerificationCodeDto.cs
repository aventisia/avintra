namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a request to create a new verification code/OTP.
/// </summary>
public class CreateVerificationCodeDto : BaseEmailProperty
{
    /// <summary>
    /// Gets or sets the purpose for which the code will be generated.
    /// </summary>
    /// <remarks>
    /// The options "Two2FA" and "UpdatePwd" are forbidden.
    /// </remarks>
    public required VerificationCodeRequestTypesEnum RequestType { get; set; }
}