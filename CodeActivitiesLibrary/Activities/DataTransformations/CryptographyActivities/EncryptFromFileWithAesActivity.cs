using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using CodeActivitiesLibrary.DataTransformations.CryptographyActivities.Enums;
using CodeActivitiesLibrary.Extensions;

namespace CodeActivitiesLibrary.DataTransformations.CryptographyActivities
{
    [DisplayName("Encrypt from File with AES")]
    [Description("Encrypts the contents of a file using AES. Supports Base64, Hex encoding for output.")]
    [ActivityMetaData(nodeImg: "/assets/Cryptography.svg")]
    public class EncryptFromFileWithAesActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Input File Path")]
        [Description("The path to the input file to be encrypted.")]
        public InArgument<string> InputFilePath { get; set; }

        [RequiredArgument]
        [DisplayName("Encryption Key")]
        [Description("Secret key used for encryption. Short keys will be hashed to 32 bytes (AES-256).")]
        public InArgument<string> Key { get; set; }

        [RequiredArgument]
        [DisplayName("Encoding Format")]
        [Description("Encoding used for the encrypted content: Base64 or Hex.")]
        public InArgument<EncodingFormatEnum> EncodingFormat { get; set; }

        [RequiredArgument]
        [DisplayName("Output File Path")]
        [Description("The path where the encrypted file should be saved.")]
        public InArgument<string> OutputFilePath { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var inputFilePath = InputFilePath.Get(context);
            var key = Key.Get(context);
            var encodingFormat = EncodingFormat.Get(context);
            var outputFilePath = OutputFilePath.Get(context);

            try
            {
                // Validate inputs
                ValidateInputs(inputFilePath, key, outputFilePath);

                // Read input file
                var content = File.ReadAllText(inputFilePath);

                // Derive valid key from input
                var keyBytes = GetValidKeyBytes(key);

                // Encrypt content
                var encryptedData = Encrypt(content, keyBytes); // Returns byte[] including IV

                // Convert based on encoding format
                string encryptedContent;
                switch (encodingFormat)
                {
                    case EncodingFormatEnum.Base64:
                        encryptedContent = Convert.ToBase64String(encryptedData);
                        break;
                    case EncodingFormatEnum.Hex:
                        encryptedContent = ByteArrayToHexString(encryptedData);
                        break;
                    case EncodingFormatEnum.Utf8:
                        encryptedContent = Encoding.UTF8.GetString(encryptedData);
                        break;
                    default:
                        throw new ArgumentException($"Unsupported encoding format: {encodingFormat}");
                }

                // Ensure output folder exists
                var outputDir = Path.GetDirectoryName(outputFilePath);
                if (!string.IsNullOrEmpty(outputDir) && !Directory.Exists(outputDir))
                    Directory.CreateDirectory(outputDir);

                // Write to output file
                File.WriteAllText(outputFilePath, encryptedContent);

                StatusMessage.Set(context, $"File successfully encrypted and saved at '{outputFilePath}'.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error encrypting file with AES: {ex.Message}");
                IsSuccess.Set(context, false);
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

            // If already valid length (AES supports 16, 24, or 32 bytes), return as-is
            if (keyBytes.Length == 16 || keyBytes.Length == 24 || keyBytes.Length == 32)
                return keyBytes;

            // Else hash it to 32 bytes (AES-256)
            using (var sha256 = SHA256.Create())
            {
                return sha256.ComputeHash(keyBytes);
            }
        }

        private static byte[] Encrypt(string content, byte[] keyBytes)
        {
            using (var aes = Aes.Create())
            {
                aes.Key = keyBytes;
                aes.GenerateIV(); // Generate random IV
                var iv = aes.IV;

                aes.Mode = CipherMode.CBC;
                aes.Padding = PaddingMode.PKCS7;

                using (var encryptor = aes.CreateEncryptor(aes.Key, aes.IV))
                using (var msEncrypt = new MemoryStream())
                {
                    using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    using (var writer = new StreamWriter(csEncrypt))
                    {
                        writer.Write(content);
                    }

                    var encryptedBytes = msEncrypt.ToArray();

                    // Combine IV + Encrypted Content
                    var result = new byte[iv.Length + encryptedBytes.Length];
                    Buffer.BlockCopy(iv, 0, result, 0, iv.Length);
                    Buffer.BlockCopy(encryptedBytes, 0, result, iv.Length, encryptedBytes.Length);

                    return result;
                }
            }
        }

        private string ByteArrayToHexString(byte[] bytes)
        {
            var sb = new StringBuilder(bytes.Length * 2);
            foreach (var b in bytes)
            {
                sb.AppendFormat("{0:x2}", b);
            }

            return sb.ToString();
        }
    }
}