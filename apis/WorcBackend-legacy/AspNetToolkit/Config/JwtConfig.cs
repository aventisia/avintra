namespace AspNetToolkit.Config;

/// <summary>
/// Represents the configuration settings for JWT (JSON Web Token).
/// </summary>
public class JwtConfig
{
    /// <summary>
    /// Gets or sets the issuer of the JWT.
    /// </summary>
    public required string Issuer { get; set; }

    /// <summary>
    /// Gets or sets the audience of the JWT.
    /// </summary>
    public required string Audience { get; set; }

    /// <summary>
    /// Gets or sets the secret key used to sign the JWT.
    /// </summary>
    public required string SecretKey { get; set; }

    /// <summary>
    /// Gets or sets the validity period (in minutes) for password reset JWTs.
    /// </summary>
    public int PwdResetJwtValidityInMinutes { get; set; }

    /// <summary>
    /// Gets or sets the validity period (in minutes) for authentication JWTs.
    /// </summary>
    public int AuthJwtValidityInMinutes { get; set; }

    /// <summary>
    /// Gets or sets the validity period (in days) for refresh tokens.
    /// </summary>
    public int RefreshTokenValidityInDays { get; set; }
}