using CodeActivitiesLibrary.DataTransformations.CryptographyActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace CodeActivitiesLibrary.DataTransformations.CryptographyActivities
{
    [DisplayName("Encrypt Text with AES")]
    [Description("Encrypts a string using AES encryption")]
    public class EncryptTextWithAesActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Plaintext to Encrypt")]
        [Description("The text you want to encrypt")]
        public InArgument<string> Plaintext { get; set; }

        [RequiredArgument]
        [DisplayName("Encryption Key")]
        [Description("The key used for encryption (must be32 bytes long)")]
        public InArgument<string> Key { get; set; }

        [RequiredArgument]
        [DisplayName("Initialization Vector (IV)")]
        [Description("The initialization vector used for encryption")]
        public InArgument<string> IV { get; set; }

        [RequiredArgument]
        [DisplayName("Encoding Format")]
        [Description("The format of the encrypted text (Base64, Hex, or UTF8)")]
        public InArgument<EncodingFormatEnum> EncodingFormat { get; set; }

        [DisplayName("Encrypted Text")]
        [Description("The encrypted text")]
        public OutArgument<string> EncryptedText { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var plaintext = Plaintext.Get(context);
            var key = Key.Get(context);
            var iv = IV.Get(context);
            var encodingFormat = EncodingFormat.Get(context);
            var encryptedText = "";
            var status = "";
            try
            {
                // Encrypt the content using AES
                var keyBytes = Encoding.UTF8.GetBytes(key);
                var ivBytes = Encoding.UTF8.GetBytes(iv);
                var encryptedBytes = Encrypt(plaintext, keyBytes, ivBytes);
                // Convert the encrypted bytes based on the encoding format
                var encryptedContent = "";
                switch (encodingFormat)
                {
                    case EncodingFormatEnum.Base64:
                        encryptedContent = Convert.ToBase64String(encryptedBytes);
                        break;
                    case EncodingFormatEnum.Hex:
                        encryptedContent = ByteArrayToHexString(encryptedBytes);
                        break;
                    default:
                        encryptedContent = Convert.ToBase64String(encryptedBytes); // Default to Base64
                        break;
                }

                encryptedText = encryptedContent;
                status = "Text encrypted successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error encrypting text with AES: {ex.Message}";
            }

            EncryptedText.Set(context, encryptedText);
            StatusMessage.Set(context, status);
        }

        private byte[] Encrypt(string content, byte[] key, byte[] iv)
        {
            using (var aes = Aes.Create())
            {
                aes.Key = key;
                aes.IV = iv;
                var contentBytes = Encoding.UTF8.GetBytes(content);
                using (var encryptor = aes.CreateEncryptor(aes.Key, aes.IV))
                using (var msEncrypt = new MemoryStream())
                {
                    using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    using (var writer = new StreamWriter(csEncrypt))
                    {
                        writer.Write(content);
                    }

                    return msEncrypt.ToArray();
                }
            }
        }

        private string ByteArrayToHexString(byte[] bytes)
        {
            var sb = new StringBuilder();
            foreach (var b in bytes)
            {
                sb.Append(b.ToString("x2"));
            }

            return sb.ToString();
        }
    }
}