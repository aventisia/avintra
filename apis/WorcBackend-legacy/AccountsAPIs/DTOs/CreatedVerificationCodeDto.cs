namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the data transfer object for sending newly created verification code/OTP as a response.
/// </summary>
public class CreatedVerificationCodeDto
{
    /// <summary>
    /// Gets or sets the primary key of the verification code database record.
    /// </summary>
    public required Guid VerificationCodeId { get; set; }

    /// <summary>
    /// Gets or sets the email/username of the account that has requested the code. Max-254 characters.
    /// </summary>
    public required string Email { get; set; }

    /// <summary>
    /// Gets or sets the purpose for which the code will be generated.
    /// </summary>
    public VerificationCodeRequestTypesEnum RequestType { get; set; }
}