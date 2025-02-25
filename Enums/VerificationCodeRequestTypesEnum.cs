namespace AspNetToolkit.Enums;

/// <summary>
/// Represents the types of verification code requests.
/// </summary>
/// <remarks>
/// IMPORTANT NOTE: Any changes to this file should be manually synced with front-end enum file.
/// </remarks>
public enum VerificationCodeRequestTypesEnum
{
    /// <summary>
    /// Request type to create verification code to verify email address, when user creates account or changes email address.
    /// </summary>
    VerifyEmailAddress,

    /// <summary>
    /// Request type to create verification code for Two-Factor Authentication (2FA).
    /// </summary>
    TwoFA,

    /// <summary>
    /// Request type to create verification code for resetting a password.
    /// </summary>
    ResetPwd,

    /// <summary>
    /// Request type to create verification code for updating a password.
    /// </summary>
    UpdatePwd,

    /// <summary>
    /// Request type to create verification code for unlocking an account.
    /// </summary>
    UnlockAccount,

    /// <summary>
    /// Request type to create verification code to verify email address.
    /// </summary>
    SendOtpToEmail,
}