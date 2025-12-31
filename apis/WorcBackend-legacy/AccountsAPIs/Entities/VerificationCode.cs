namespace AccountsAPIs.Entities;

/// <summary>
/// Represents a verification code record.
/// </summary>
[Table("VerificationCodes")]
public class VerificationCode
{
    /// <summary>
    /// Gets or sets the primary key of the VerificationCode record.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the verification code generated for the user.
    /// </summary>
    [MaxLength(6)]
    public required string SecretCode { get; set; }

    /// <summary>
    /// Gets or sets the purpose for which the code will be generated.
    /// Possible values: VerifyEmailAddress, TwoFA, ResetPwd, UpdatePwd, UnlockAccount etc.
    /// </summary>
    [MaxLength(50)]
    public VerificationCodeRequestTypesEnum RequestType { get; set; }

    /// <summary>
    /// Gets or sets the ID of the device/client using which the request to generate the code was made.
    /// </summary>
    public required string DeviceId { get; set; }

    /// <summary>
    /// Gets or sets the expiration date and time of the verification code.
    /// </summary>
    public DateTimeOffset ExpiresOn { get; set; }

    /// <summary>
    /// Gets or sets the creation date and time of the verification code.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the email/username of the user who is requesting to create the code.
    /// </summary>
    /// <remarks>
    /// Note: Instead of User we are using Email prop because at the time of account creation other 
    /// scenarios where user does not exist, we won't be able to create verification code
    /// </remarks>
    [MaxLength(254)]
    [EmailAddress]
    public required string Email { get; set; }

    /// <summary>
    /// Gets or sets the version number used for row versioning. Row versioning helps detect conflicts between concurrent transactions
    /// </summary>
    /// <remarks>
    /// It is a hidden system column and won't be visible in table's column list.
    /// For more information, see https://www.npgsql.org/efcore/modeling/concurrency.html?tabs=data-annotations
    /// </remarks>
    [Timestamp]
    public uint Version { get; set; }
}