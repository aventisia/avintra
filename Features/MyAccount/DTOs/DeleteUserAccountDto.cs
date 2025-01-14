namespace AccountsAPIs.DTOs;
// <summary>
/// Represents the data transfer object for deleting existing user account.
/// </summary>
public class DeleteUserAccountDto 
{
 
    /// <summary>
    /// Gets or sets the primary key of the verification code database record.
    /// </summary>
    [RequiredGuid]
    public Guid VerificationCodeId { get; set; }

    /// <summary>
    /// Gets or sets the verification code or OTP (One-Time Password) provided by the user.
    /// </summary>
    [StringLength(255)]
    public required string SecretCode { get; set; }

    

}