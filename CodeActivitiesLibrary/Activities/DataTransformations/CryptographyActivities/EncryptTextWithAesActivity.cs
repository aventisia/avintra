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
    [DisplayName("Encrypt Text with AES")]
    [Description("Encrypts a string using AES encryption. Short keys are hashed securely to 32 bytes.")]
    public class EncryptTextWithAesActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Plaintext to Encrypt")]
        [Description("The text you want to encrypt.")]
        public InArgument<string> Plaintext { get; set; }

        [RequiredArgument]
        [DisplayName("Encryption Key")]
        [Description("Secret key used for encryption. Short keys will be hashed to 32 bytes (AES-256).")]
        public InArgument<string> Key { get; set; }

        [RequiredArgument]
        [DisplayName("Initialization Vector (IV)")]
        [Description("16-character IV used in encryption process.")]
        public InArgument<string> IV { get; set; }

        [RequiredArgument]
        [DisplayName("Encoding Format")]
        [Description("Encoding used for the encrypted output: Base64 or Hex.")]
        public InArgument<EncodingFormatEnum> EncodingFormat { get; set; }

        [DisplayName("Encrypted Text Result")]
        [Description("Returns the encrypted text based on selected encoding format.")]
        public OutArgument<string> EncryptedText { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var plaintext = Plaintext.Get(context);
            var key = Key.Get(context);
            var iv = IV.Get(context);
            var encodingFormat = EncodingFormat.Get(context);

            try
            {
                // Validate inputs
                ValidateInputs(plaintext, key, iv);

                // Derive valid 32-byte key from input
                var keyBytes = GetValidKeyBytes(key);

                // Convert IV to byte[16]
                if (iv.Length != 16)
                    throw new ArgumentException("IV must be exactly 16 characters long.");
                var ivBytes = Encoding.UTF8.GetBytes(iv);

                // Encrypt content
                var encryptedBytes = Encrypt(plaintext, keyBytes, ivBytes);

                // Encode result
                string encryptedContent;
                switch (encodingFormat)
                {
                    case EncodingFormatEnum.Base64:
                        encryptedContent = Convert.ToBase64String(encryptedBytes);
                        break;
                    case EncodingFormatEnum.Hex:
                        encryptedContent = ByteArrayToHexString(encryptedBytes);
                        break;
                    case EncodingFormatEnum.Utf8:
                        encryptedContent = Encoding.UTF8.GetString(encryptedBytes);
                        break;
                    default:
                        throw new InvalidOperationException("Unsupported encoding format.");
                }

                // Set outputs
                EncryptedText.Set(context, encryptedContent);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Text encrypted successfully.");
            }
            catch (Exception ex)
            {
                EncryptedText.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error encrypting text with AES: {ex.Message}");
            }
        }

        private void ValidateInputs(string plaintext, string key, string iv)
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

            // If already valid length, return as-is
            if (keyBytes.Length == 32)
                return keyBytes;

            // Else hash it to 32 bytes (AES-256)
            using (var sha256 = SHA256.Create())
            {
                return sha256.ComputeHash(keyBytes);
            }
        }

        private static byte[] Encrypt(string content, byte[] keyBytes, byte[] ivBytes)
        {
            using (var aes = Aes.Create())
            {
                aes.Key = keyBytes;
                aes.IV = ivBytes;
                aes.Mode = CipherMode.CBC;
                aes.Padding = PaddingMode.PKCS7;

                using (var msEncrypt = new MemoryStream())
                using (var encryptor = aes.CreateEncryptor(aes.Key, aes.IV))
                using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                using (var writer = new StreamWriter(csEncrypt))
                {
                    writer.Write(content);
                    writer.Flush();
                    csEncrypt.FlushFinalBlock(); // Ensure padding is applied
                    return msEncrypt.ToArray();
                }
            }
        }

        private static string ByteArrayToHexString(byte[] bytes)
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