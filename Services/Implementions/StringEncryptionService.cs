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
            throw new ArgumentNullException(nameof(plainText), "Plain text cannot be null or empty.");
        }

        using (Aes aesAlg = Aes.Create())
        {
            // Set the encryption key and IV from the configuration
            aesAlg.Key = Encoding.UTF8.GetBytes(_config.AES_ENCRYPTION_KEY);
            aesAlg.IV = Encoding.UTF8.GetBytes(_config.AES_INITIALIZATION_VECTOR);

            using (ICryptoTransform encrypt = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV))
            using (MemoryStream ms = new MemoryStream())
            using (CryptoStream cs = new CryptoStream(ms, encrypt, CryptoStreamMode.Write))
            using (StreamWriter sw = new StreamWriter(cs))
            {
                // Write the plain text to the stream to encrypt it
                sw.Write(plainText);
                sw.Close(); // Ensure all data is flushed to the stream

                // Return the encrypted string as Base64
                return Convert.ToBase64String(ms.ToArray());
            }
        }
    }

    // Decrypts an encrypted string (Base64 format) using AES decryption.
    public string DecryptString(string encryptedText)
    {
        // Ensure the encrypted text is not null or empty
        if (string.IsNullOrEmpty(encryptedText))
        {
            throw new ArgumentNullException(nameof(encryptedText), "Encrypted text cannot be null or empty.");
        }

        using (Aes aesAlg = Aes.Create())
        {
            // Set the decryption key and IV from the configuration
            aesAlg.Key = Encoding.UTF8.GetBytes(_config.AES_ENCRYPTION_KEY);
            aesAlg.IV = Encoding.UTF8.GetBytes(_config.AES_INITIALIZATION_VECTOR);

            using (ICryptoTransform decrypt = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV))
            using (MemoryStream ms = new MemoryStream(Convert.FromBase64String(encryptedText)))
            using (CryptoStream cs = new CryptoStream(ms, decrypt, CryptoStreamMode.Read))
            using (StreamReader sr = new StreamReader(cs))
            {
                // Read the decrypted string and return it
                return sr.ReadToEnd();
            }
        }
    }
}