namespace AccountsAPIs.DTOs;

/// <summary>
/// To request to validate verification code/OTP
/// </summary>
public class CheckVerificationCodeDto : BaseEmailProperty
{
    /// <summary>
    /// Primary key of verificaiton code db record
    /// </summary>
    [RequiredGuid]
    public Guid VerificationCodeId { get; set; }

    /// <summary>
    /// The purpose for which code will be generated. <br/>
    /// Possible values: VerifyEmailAddress, TwoFA, ResetPwd, UpdatePwd, UnlockAccount
    /// </summary>
    public required VerificationCodeRequestTypesEnum RequestType { get; set; }

    /// <summary>
    /// The verification code or OTP provided by user
    /// </summary>
    [StringLength(255)]
    public required string SecretCode { get; set; }
}