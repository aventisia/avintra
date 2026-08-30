using System.Security.Cryptography;

namespace NodeLibrary.CryptographyNodes;

[DisplayName("Decrypt Text with AES"), Description("Decrypts a Base64-encoded string using AES with optional key hashing for short keys.")]
[NodeMetadata(icon: "/assets/Cryptography.svg")]
public class DecryptTextWithAesNode : BaseNode
{
    [DisplayName("Ciphertext to Decrypt"), Description("The Base64-encoded encrypted text to decrypt.")]
    public required InArgument<string> Ciphertext { get; set; }

    [DisplayName("Decryption Key"), Description("The key used for decryption. If it's shorter than required, it will be hashed to a valid length (16/24/32 bytes).")]
    public required InArgument<string> Key { get; set; }

    [DisplayName("Initialization Vector (IV)"), Description("The initialization vector (must be exactly 16 characters long).")]
    public required InArgument<string> IV { get; set; }

    [DisplayName("Decrypted Text Result"), Description("Outputs the decrypted plain text after decryption.")]
    public OutArgument<string> DecryptedText { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        var ciphertext = Ciphertext.Get(context) ?? string.Empty;
        var key = Key.Get(context) ?? string.Empty;
        var iv = IV.Get(context) ?? string.Empty;

        try
        {
            ValidateInputs(ciphertext, key, iv);
            var keyBytes = GetValidKeyBytes(key);
            var ivBytes = Encoding.UTF8.GetBytes(iv.Substring(0, 16));
            var cipherBytes = Convert.FromBase64String(ciphertext);
            var decryptedText = Decrypt(cipherBytes, keyBytes, ivBytes);

            DecryptedText.Set(context, decryptedText);
            status = "Text decrypted successfully.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            DecryptedText.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error decrypting text with AES: {ex.Message}");
        }
    }

    private static void ValidateInputs(string ciphertext, string key, string iv)
    {
        if (string.IsNullOrWhiteSpace(ciphertext))
            throw new ArgumentException("Ciphertext cannot be null or empty.");

        if (string.IsNullOrWhiteSpace(key))
            throw new ArgumentException("Key cannot be null or empty.");

        if (string.IsNullOrWhiteSpace(iv))
            throw new ArgumentException("IV cannot be null or empty.");

        if (iv.Length != 16)
            throw new ArgumentException("IV must be exactly 16 characters long.");
    }

    private static byte[] GetValidKeyBytes(string key)
    {
        var keyBytes = Encoding.UTF8.GetBytes(key);

        if (keyBytes.Length == 16 || keyBytes.Length == 24 || keyBytes.Length == 32)
            return keyBytes;

        using var sha256 = SHA256.Create();
        return sha256.ComputeHash(keyBytes);
    }

    private static string Decrypt(byte[] cipherBytes, byte[] keyBytes, byte[] ivBytes)
    {
        using var aes = Aes.Create();
        aes.Key = keyBytes;
        aes.IV = ivBytes;
        aes.Padding = PaddingMode.PKCS7;
        aes.Mode = CipherMode.CBC;

        using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
        using var msDecrypt = new MemoryStream(cipherBytes);
        using var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read);
        using var reader = new StreamReader(csDecrypt);
        return reader.ReadToEnd();
    }
}
