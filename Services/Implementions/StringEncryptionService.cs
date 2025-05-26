namespace AspNetToolkit.Services;

public class StringEncryptionService : IStringEncryptionService
{
    private readonly AesEncryptionConfig _config;

    // Constructor that initializes the encryption configuration.
    public StringEncryptionService(AesEncryptionConfig aesConfig)
    {
        // Ensure the configuration is not null
        _config = aesConfig ?? throw new ArgumentNullException(nameof(aesConfig), "AES config cannot be null.");
    }

    // Encrypts a plain text string using AES encryption.
    public string EncryptString(string plainText)
    {
        // Ensure the plain text is not null or empty
        if (string.IsNullOrEmpty(plainText))
        {
            return plainText;
        }

        using var aesAlg = Aes.Create();
        // Set the encryption key and IV from the configuration
        aesAlg.Key = Encoding.UTF8.GetBytes(_config.AES_ENCRYPTION_KEY);
        aesAlg.IV = Encoding.UTF8.GetBytes(_config.AES_INITIALIZATION_VECTOR);

        using var encrypt = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);
        using var ms = new MemoryStream();
        using var cs = new CryptoStream(ms, encrypt, CryptoStreamMode.Write);
        using var sw = new StreamWriter(cs);
        // Write the plain text to the stream to encrypt it
        sw.Write(plainText);
        sw.Close(); // Ensure all data is flushed to the stream

        // Return the encrypted string as Base64
        return Convert.ToBase64String(ms.ToArray());
    }

    // Decrypts an encrypted string (Base64 format) using AES decryption.
    public string DecryptString(string encryptedText)
    {
        // Ensure the encrypted text is not null or empty
        if (string.IsNullOrEmpty(encryptedText))
        {
            return encryptedText;
        }

        using var aesAlg = Aes.Create();
        // Set the decryption key and IV from the configuration
        aesAlg.Key = Encoding.UTF8.GetBytes(_config.AES_ENCRYPTION_KEY);
        aesAlg.IV = Encoding.UTF8.GetBytes(_config.AES_INITIALIZATION_VECTOR);

        using var decrypt = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);
        using var ms = new MemoryStream(Convert.FromBase64String(encryptedText));
        using var cs = new CryptoStream(ms, decrypt, CryptoStreamMode.Read);
        using var sr = new StreamReader(cs);
        // Read the decrypted string and return it
        return sr.ReadToEnd();
    }
}