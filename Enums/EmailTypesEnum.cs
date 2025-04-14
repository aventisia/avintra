namespace AspNetToolkit.Enums;

/// <summary>
/// Represents the types of emails that can be sent.
/// </summary>
public enum EmailTypesEnum
{
    /// <summary>
    /// Email type to send verification code to verify email address (Verify your email address).
    /// </summary>
    VerifyEmailAddress,

    /// <summary>
    /// Email type to send welcome email to user (Welcome to Aventisia!) on account creation.
    /// </summary>
    AccountCreated,

    /// <summary>
    /// Email Type to send verification code for 2FA.
    /// </summary>
    TwoFA,

    /// <summary>
    /// Email type to send verification code to reset password (Want to reset your password?).
    /// </summary>
    ResetPwd,

    /// <summary>
    /// Email type to send a password reset email (Your password has been reset).
    /// </summary>
    PwdReset,

    /// <summary>
    /// Email type to send email when password has ben updated successfully (Your password has been updated).
    /// </summary>
    PwdUpdated,

    /// <summary>
    /// Email type to send email when user submits a contact us form.
    /// </summary>
    ContactUsRequest,

    /// <summary>
    /// Request type to create verification code to verify new email address.
    /// </summary>
    UpdateEmail,

    /// <summary>
    /// Request type to create verification code to verify email address for account deactivation.
    /// </summary>
    AccountDeactivation,
}