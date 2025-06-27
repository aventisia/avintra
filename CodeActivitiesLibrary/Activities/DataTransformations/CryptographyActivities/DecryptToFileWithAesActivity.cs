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
    [DisplayName("Decrypt to File with AES")]
    [Description("Decrypts an encrypted file using AES. Supports Base64, Hex, and UTF8-encoded inputs.")]
    public class DecryptToFileWithAesActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Encrypted File Path")]
        [Description("The path to the file containing the encrypted data.")]
        public InArgument<string> EncryptedFilePath { get; set; }

        [RequiredArgument]
        [DisplayName("Decryption Key")]
        [Description("Secret key used for decryption. Short keys will be hashed to 32 bytes (AES-256).")]
        public InArgument<string> Key { get; set; }

        [RequiredArgument]
        [DisplayName("Encoding Format")]
        [Description("Encoding used for the encrypted content: Base64, Hex, or UTF8.")]
        public InArgument<EncodingFormatEnum> EncodingFormat { get; set; }

        [RequiredArgument]
        [DisplayName("Initialization Vector (IV)")]
        [Description("16-character IV used during encryption. Must match the one used during encryption.")]
        public InArgument<string> Iv { get; set; }

        [RequiredArgument]
        [DisplayName("Output File Path")]
        [Description("The path where the decrypted file should be saved.")]
        public InArgument<string> OutputFilePath { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var encryptedFilePath = EncryptedFilePath.Get(context);
            var key = Key.Get(context);
            var iv = Iv.Get(context);
            var encodingFormat = EncodingFormat.Get(context);
            var outputFilePath = OutputFilePath.Get(context);

            try
            {
                // Validate inputs
                ValidateInputs(encryptedFilePath, key, iv, outputFilePath);

                // Read encrypted content
                var encryptedContent = File.ReadAllText(encryptedFilePath);

                // Convert based on encoding format
                byte[] cipherBytes;
                switch (encodingFormat)
                {
                    case EncodingFormatEnum.Base64:
                        cipherBytes = Convert.FromBase64String(encryptedContent);
                        break;
                    case EncodingFormatEnum.Hex:
                        cipherBytes = HexStringToByteArray(encryptedContent);
                        break;
                    case EncodingFormatEnum.Utf8:
                        cipherBytes = Encoding.UTF8.GetBytes(encryptedContent);
                        break;
                    default:
                        throw new ArgumentException($"Unsupported encoding format: {encodingFormat}");
                }

                // Derive valid key from input
                var keyBytes = GetValidKeyBytes(key);

                // Validate and convert IV
                if (iv.Length != 16)
                    throw new ArgumentException("IV must be exactly 16 characters long.");
                var ivBytes = Encoding.UTF8.GetBytes(iv);

                // Decrypt
                var decryptedText = Decrypt(cipherBytes, keyBytes, ivBytes);

                // Write decrypted text to output file
                var outputDir = Path.GetDirectoryName(outputFilePath);
                if (!string.IsNullOrEmpty(outputDir) && !Directory.Exists(outputDir))
                    Directory.CreateDirectory(outputDir);

                File.WriteAllText(outputFilePath, decryptedText);

                StatusMessage.Set(context, $"File successfully decrypted and saved at '{outputFilePath}'.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error decrypting file with AES: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private static void ValidateInputs(string encryptedPath, string key, string iv, string outputPath)
        {
            if (!File.Exists(encryptedPath))
                throw new FileNotFoundException("Encrypted file not found.", encryptedPath);

            if (string.IsNullOrWhiteSpace(key))
                throw new ArgumentException("Key cannot be null or empty.");

            if (string.IsNullOrWhiteSpace(iv))
                throw new ArgumentException("IV cannot be null or empty.");

            if (string.IsNullOrWhiteSpace(outputPath))
                throw new ArgumentException("Output file path cannot be null or empty.");
        }

        private static byte[] GetValidKeyBytes(string key)
        {
            var keyBytes = Encoding.UTF8.GetBytes(key);

            // If already valid length, return as-is
            if (keyBytes.Length == 16 || keyBytes.Length == 24 || keyBytes.Length == 32)
                return keyBytes;

            // Else hash it to 32 bytes (AES-256)
            using (var sha256 = SHA256.Create())
            {
                return sha256.ComputeHash(keyBytes);
            }
        }

        private static string Decrypt(byte[] cipherBytes, byte[] keyBytes, byte[] ivBytes)
        {
            using (var aes = Aes.Create())
            {
                aes.Key = keyBytes;
                aes.IV = ivBytes;
                aes.Mode = CipherMode.CBC;
                aes.Padding = PaddingMode.PKCS7;

                using (var decryptor = aes.CreateDecryptor(aes.Key, aes.IV))
                using (var msDecrypt = new MemoryStream(cipherBytes))
                using (var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                using (var reader = new StreamReader(csDecrypt))
                {
                    return reader.ReadToEnd();
                }
            }
        }

        private static byte[] HexStringToByteArray(string hexString)
        {
            var sanitized = hexString.Replace(" ", "").Replace("\n", "").Replace("\r", "");

            if (sanitized.Length % 2 != 0)
                throw new ArgumentException("Hex string must have even length.", nameof(hexString));

            var bytes = new byte[sanitized.Length / 2];
            for (var i = 0; i < sanitized.Length; i += 2)
            {
                var currentPair = sanitized.Substring(i, 2);
                bytes[i / 2] = Convert.ToByte(currentPair, 16);
            }

            return bytes;
        }
    }
}