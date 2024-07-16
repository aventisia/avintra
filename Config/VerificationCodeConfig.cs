namespace AspNetToolkit.Config;

/// <summary>
/// Represents the configuration for verification codes.
/// </summary>
public class VerificationCodeConfig
{
    /// <summary>
    /// Gets or sets the validity period of the verification code in minutes.
    /// </summary>
    public int ValidityInMinutes { get; set; }

    /// <summary>
    /// Gets or sets the number of characters in the verification code.
    /// </summary>
    public int NumberOfCharacters { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the verification code should be alphanumeric.
    /// </summary>
    public required string IsAlphaNumeric { get; set; }
}