namespace AspNetToolkit.Services;

/// <summary>
/// Provides methods for encrypting and decrypting strings using AES encryption.
/// </summary>
public interface IStringEncryptionService
{
    /// <summary>
    /// Encrypts a plain text string using AES encryption.
    /// </summary>
    /// <param name="plainText">The plain text string to encrypt.</param>
    /// <returns>The encrypted string in Base64 format.</returns>
    string EncryptString(string plainText);

    /// <summary>
    /// Decrypts an encrypted string that was previously encrypted using AES encryption.
    /// </summary>
    /// <param name="encryptedText">The encrypted string in Base64 format to decrypt.</param>
    /// <returns>The decrypted plain text string.</returns>
    string DecryptString(string encryptedText);
}
