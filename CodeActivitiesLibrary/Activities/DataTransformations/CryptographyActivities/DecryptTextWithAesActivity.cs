using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Security.Cryptography;
using System.Text;

namespace CodeActivitiesLibrary.DataTransformations.CryptographyActivities
{
    [DisplayName("Decrypt Text with AES")]
    [Description("Decrypt a string using AES encryption with a specified key and initialization vector.")]
    public class DecryptTextWithAesActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Ciphertext to Decrypt")]
        [Description("Enter the ciphertext that you want to decrypt.")]
        public InArgument<string> Ciphertext { get; set; }

        [RequiredArgument]
        [DisplayName("Decryption Key")]
        [Description("Enter the key used for decrypting the ciphertext.")]
        public InArgument<string> Key { get; set; }

        [RequiredArgument]
        [DisplayName("Initialization Vector")]
        [Description("Enter the initialization vector (IV) used in the decryption process.")]
        public InArgument<string> IV { get; set; }

        [DisplayName("Decrypted Text Result")]
        [Description("Outputs the decrypted text after the decryption process.")]
        public OutArgument<string> DecryptedText { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var ciphertext = Ciphertext.Get(context);
            var key = Key.Get(context);
            var iv = IV.Get(context);
            var decryptedText = "";
            try
            {
                decryptedText = Decrypt(ciphertext, key, iv);
                DecryptedText.Set(context, decryptedText);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Text decrypted successfully.");
            }
            catch (Exception ex)
            {
                DecryptedText.Set(context, decryptedText);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error decrypting text with AES: {ex.Message}");
            }
        }

        private string Decrypt(string ciphertext, string key, string iv)
        {
            // Convert the key and IV to bytes
            var keyBytes = Encoding.UTF8.GetBytes(key);
            var ivBytes = Encoding.UTF8.GetBytes(iv);
            var cipherBytes = Convert.FromBase64String(ciphertext);
            using (var aes = Aes.Create())
            {
                aes.Key = keyBytes;
                aes.IV = ivBytes;
                using (var decryptor = aes.CreateDecryptor(aes.Key, aes.IV))
                using (var msDecrypt = new System.IO.MemoryStream(cipherBytes))
                using (var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                using (var reader = new System.IO.StreamReader(csDecrypt))
                {
                    return reader.ReadToEnd();
                }
            }
        }
    }
}