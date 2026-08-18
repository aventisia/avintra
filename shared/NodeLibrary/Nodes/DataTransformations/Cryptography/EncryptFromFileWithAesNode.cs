using NodeLibrary.CryptographyNodes.Enums;
using System.Security.Cryptography;

namespace NodeLibrary.CryptographyNodes;

[DisplayName("Encrypt from File with AES"), Description("Encrypts the contents of a file using AES. Supports Base64, Hex encoding for output.")]
[NodeMetadata(icon: "/assets/Cryptography.svg")]
public class EncryptFromFileWithAesNode : BaseNode
{
    [DisplayName("Input File Path"), Description("The path to the input file to be encrypted.")]
    public required InArgument<string> InputFilePath { get; set; }

    [DisplayName("Encryption Key"), Description("Secret key used for encryption. Short keys will be hashed to 32 bytes (AES-256).")]
    public required InArgument<string> Key { get; set; }

    [DisplayName("Encoding Format"), Description("Encoding used for the encrypted content: Base64 or Hex.")]
    public required InArgument<EncodingFormatEnum> EncodingFormat { get; set; } = new InArgument<EncodingFormatEnum>(EncodingFormatEnum.Base64);

    [DisplayName("Output File Path"), Description("The path where the encrypted file should be saved.")]
    public required InArgument<string> OutputFilePath { get; set; }

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        var inputFilePath = InputFilePath.Get(context);
        var key = Key.Get(context);
        var encodingFormat = EncodingFormat.Get(context);
        var outputFilePath = OutputFilePath.Get(context);

        try
        {
            ValidateInputs(inputFilePath, key, outputFilePath);
            var content = File.ReadAllText(inputFilePath);
            var keyBytes = GetValidKeyBytes(key);
            var encryptedData = Encrypt(content, keyBytes);

            string encryptedContent = encodingFormat switch
            {
                EncodingFormatEnum.Base64 => Convert.ToBase64String(encryptedData),
                EncodingFormatEnum.Hex => ByteArrayToHexString(encryptedData),
                EncodingFormatEnum.Utf8 => Encoding.UTF8.GetString(encryptedData),
                _ => throw new ArgumentException($"Unsupported encoding format: {encodingFormat}")
            };

            var outputDir = Path.GetDirectoryName(outputFilePath);
            if (!string.IsNullOrEmpty(outputDir) && !Directory.Exists(outputDir))
                Directory.CreateDirectory(outputDir);

            File.WriteAllText(outputFilePath, encryptedContent);

            status = $"File successfully encrypted and saved at '{outputFilePath}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error encrypting file with AES: {ex.Message}");
        }
    }

    private static void ValidateInputs(string inputPath, string key, string outputPath)
    {
        if (!File.Exists(inputPath))
            throw new FileNotFoundException("Input file not found.", inputPath);

        if (string.IsNullOrWhiteSpace(key))
            throw new ArgumentException("Key cannot be null or empty.");

        if (string.IsNullOrWhiteSpace(outputPath))
            throw new ArgumentException("Output file path cannot be null or empty.");
    }

    private static byte[] GetValidKeyBytes(string key)
    {
        var keyBytes = Encoding.UTF8.GetBytes(key);

        if (keyBytes.Length == 16 || keyBytes.Length == 24 || keyBytes.Length == 32)
            return keyBytes;

        using var sha256 = SHA256.Create();
        return sha256.ComputeHash(keyBytes);
    }

    private static byte[] Encrypt(string content, byte[] keyBytes)
    {
        using var aes = Aes.Create();
        aes.Key = keyBytes;
        aes.GenerateIV();
        var iv = aes.IV;

        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;

        using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
        using var msEncrypt = new MemoryStream();
        using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
        using (var writer = new StreamWriter(csEncrypt))
        {
            writer.Write(content);
        }

        var encryptedBytes = msEncrypt.ToArray();
        var result = new byte[iv.Length + encryptedBytes.Length];
        Buffer.BlockCopy(iv, 0, result, 0, iv.Length);
        Buffer.BlockCopy(encryptedBytes, 0, result, iv.Length, encryptedBytes.Length);
        return result;
    }

    private static string ByteArrayToHexString(byte[] bytes)
    {
        var sb = new StringBuilder(bytes.Length * 2);
        foreach (var b in bytes)
            sb.AppendFormat("{0:x2}", b);

        return sb.ToString();
    }
}
