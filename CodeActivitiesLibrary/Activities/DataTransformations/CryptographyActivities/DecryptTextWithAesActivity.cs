using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using CodeActivitiesLibrary.Extensions;

namespace CodeActivitiesLibrary.DataTransformations.CryptographyActivities
{
    [DisplayName("Decrypt Text with AES")]
    [Description("Decrypts a Base64-encoded string using AES with optional key hashing for short keys.")]
    public class DecryptTextWithAesActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Ciphertext to Decrypt")]
        [Description("The Base64-encoded encrypted text to decrypt.")]
        public InArgument<string> Ciphertext { get; set; }

        [RequiredArgument]
        [DisplayName("Decryption Key")]
        [Description(
            "The key used for decryption. If it's shorter than required, it will be hashed to a valid length (16/24/32 bytes).")]
        public InArgument<string> Key { get; set; }

        [RequiredArgument]
        [DisplayName("Initialization Vector (IV)")]
        [Description("The initialization vector (must be exactly 16 characters long).")]
        public InArgument<string> IV { get; set; }

        [DisplayName("Decrypted Text Result")]
        [Description("Outputs the decrypted plain text after decryption.")]
        public OutArgument<string> DecryptedText { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var ciphertext = Ciphertext.Get(context);
            var key = Key.Get(context);
            var iv = IV.Get(context);

            try
            {
                // Validate and sanitize inputs
                ValidateInputs(ciphertext, key, iv);

                // Derive valid 16/24/32 byte key from input
                var keyBytes = GetValidKeyBytes(key);

                // Convert IV to 16-byte array
                var ivBytes = Encoding.UTF8.GetBytes(iv.Substring(0, 16));

                // Decode cipher text from Base64
                var cipherBytes = Convert.FromBase64String(ciphertext);

                // Perform AES decryption
                var decryptedText = Decrypt(cipherBytes, keyBytes, ivBytes);

                // Set outputs
                DecryptedText.Set(context, decryptedText);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Text decrypted successfully.");
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

            // If key is already valid length (AES supports 16, 24, or 32 bytes)
            if (keyBytes.Length == 16 || keyBytes.Length == 24 || keyBytes.Length == 32)
                return keyBytes;

            // If key is too short → hash it to produce a 32-byte key (AES-256)
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
                aes.Padding = PaddingMode.PKCS7;
                aes.Mode = CipherMode.CBC;

                using (var decryptor = aes.CreateDecryptor(aes.Key, aes.IV))
                using (var msDecrypt = new MemoryStream(cipherBytes))
                using (var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                using (var reader = new StreamReader(csDecrypt))
                {
                    return reader.ReadToEnd();
                }
            }
        }
    }
}