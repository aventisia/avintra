namespace AspNetToolkit.Services;

public class StringEncryptionService : IStringEncryptionService
{
    private readonly EnvironmentConfig _environmentConfig;

    // Constructor that initializes the encryption configuration.
    public StringEncryptionService(EnvironmentConfig environmentConfig)
    {
        _environmentConfig = environmentConfig;
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
        // Set the encryption key and IV from the configuration (decode from Base64)
        aesAlg.Key = Convert.FromBase64String(_environmentConfig.AesEncryptionKey);
        aesAlg.IV = Convert.FromBase64String(_environmentConfig.AesInitializationVector);

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
        // Set the decryption key and IV from the configuration (decode from Base64)
        aesAlg.Key = Convert.FromBase64String(_environmentConfig.AesEncryptionKey);
        aesAlg.IV = Convert.FromBase64String(_environmentConfig.AesInitializationVector);

        using var decrypt = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);
        using var ms = new MemoryStream(Convert.FromBase64String(encryptedText));
        using var cs = new CryptoStream(ms, decrypt, CryptoStreamMode.Read);
        using var sr = new StreamReader(cs);
        // Read the decrypted string and return it
        return sr.ReadToEnd();
    }
}