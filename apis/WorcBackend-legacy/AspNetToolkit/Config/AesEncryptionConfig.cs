namespace AspNetToolkit.Config;

/// <summary>
/// Represents the configuration for AES encryption settings.
/// </summary>
public class AesEncryptionConfig
{
    /// <summary>
    /// The key used for AES encryption (32 bytes for AES-256).
    /// </summary>
    public required string AES_ENCRYPTION_KEY { get; set; }

    /// <summary>
    /// The initialization vector (IV) used for AES encryption (16 bytes).
    /// </summary>
    public required string AES_INITIALIZATION_VECTOR { get; set; }
}
