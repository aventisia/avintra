using NodeLibrary.CryptographyNodes.Enums;
using System.Security.Cryptography;

namespace NodeLibrary.CryptographyNodes;

[DisplayName("Encrypt Text with AES"), Description("Encrypts a string using AES encryption. Short keys are hashed securely to 32 bytes.")]
[NodeMetadata(icon: "/assets/Cryptography.svg")]
public class EncryptTextWithAesNode : BaseNode
{
    [DisplayName("Plaintext to Encrypt"), Description("The text you want to encrypt.")]
    public required InArgument<string> Plaintext { get; set; }

    [DisplayName("Encryption Key"), Description("Secret key used for encryption. Short keys will be hashed to 32 bytes (AES-256).")]
    public required InArgument<string> Key { get; set; }

    [DisplayName("Initialization Vector (IV)"), Description("16-character IV used in encryption process.")]
    public required InArgument<string> IV { get; set; }

    [DisplayName("Encoding Format"), Description("Encoding used for the encrypted output: Base64 or Hex.")]
    public required InArgument<EncodingFormatEnum> EncodingFormat { get; set; } = new InArgument<EncodingFormatEnum>(EncodingFormatEnum.Base64);

    [DisplayName("Encrypted Text Result"), Description("Returns the encrypted text based on selected encoding format.")]
    public OutArgument<string> EncryptedText { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        var plaintext = Plaintext.Get(context) ?? string.Empty;
        var key = Key.Get(context) ?? string.Empty;
        var iv = IV.Get(context) ?? string.Empty;
        var encodingFormat = EncodingFormat.Get(context);

        try
        {
            ValidateInputs(plaintext, key, iv);
            var keyBytes = GetValidKeyBytes(key);

            if (iv.Length != 16)
                throw new ArgumentException("IV must be exactly 16 characters long.");
            var ivBytes = Encoding.UTF8.GetBytes(iv);

            var encryptedBytes = Encrypt(plaintext, keyBytes, ivBytes);

            string encryptedContent = encodingFormat switch
            {
                EncodingFormatEnum.Base64 => Convert.ToBase64String(encryptedBytes),
                EncodingFormatEnum.Hex => ByteArrayToHexString(encryptedBytes),
                EncodingFormatEnum.Utf8 => Encoding.UTF8.GetString(encryptedBytes),
                _ => throw new InvalidOperationException("Unsupported encoding format.")
            };

            EncryptedText.Set(context, encryptedContent);
            status = "Text encrypted successfully.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            EncryptedText.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error encrypting text with AES: {ex.Message}");
        }
    }

    private static void ValidateInputs(string plaintext, string key, string iv)
    {
        if (string.IsNullOrWhiteSpace(plaintext))
            throw new ArgumentException("Plaintext cannot be null or empty.");

        if (string.IsNullOrWhiteSpace(key))
            throw new ArgumentException("Key cannot be null or empty.");

        if (string.IsNullOrWhiteSpace(iv))
            throw new ArgumentException("IV cannot be null or empty.");
    }

    private static byte[] GetValidKeyBytes(string key)
    {
        var keyBytes = Encoding.UTF8.GetBytes(key);

        if (keyBytes.Length == 32)
            return keyBytes;

        using var sha256 = SHA256.Create();
        return sha256.ComputeHash(keyBytes);
    }

    private static byte[] Encrypt(string content, byte[] keyBytes, byte[] ivBytes)
    {
        using var aes = Aes.Create();
        aes.Key = keyBytes;
        aes.IV = ivBytes;
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;

        using var msEncrypt = new MemoryStream();
        using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
        using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
        using (var writer = new StreamWriter(csEncrypt))
        {
            writer.Write(content);
            writer.Flush();
            csEncrypt.FlushFinalBlock();
        }

        return msEncrypt.ToArray();
    }

    private static string ByteArrayToHexString(byte[] bytes)
    {
        var sb = new StringBuilder(bytes.Length * 2);
        foreach (var b in bytes)
            sb.AppendFormat("{0:x2}", b);

        return sb.ToString();
    }
}
