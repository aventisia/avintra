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
    [DisplayName("Decrypt to File with AES")]
    [Description("Decrypt the contents of a file with AES based on a specified key and an encoding format")]
    public class DecryptToFileWithAesActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Encrypted File Path")]
        [Description("The path to the encrypted file.")]
        public InArgument<string> EncryptedFilePath { get; set; }

        [RequiredArgument]
        [DisplayName("Key")]
        [Description("The decryption key.")]
        public InArgument<string> Key { get; set; }

        [RequiredArgument]
        [DisplayName("Encoding Format")]
        [Description("The encoding format of the encrypted content.")]
        public InArgument<EncodingFormatEnum> EncodingFormat { get; set; }

        [RequiredArgument]
        [DisplayName("Output File Path")]
        [Description("The path to the output file.")]
        public InArgument<string> OutputFilePath { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var encryptedFilePath = EncryptedFilePath.Get(context);
            var key = Key.Get(context);
            var encodingFormat = EncodingFormat.Get(context);
            var outputFilePath = OutputFilePath.Get(context);
            var status = "";
            try
            {
                // Read the encrypted file
                var encryptedContent = File.ReadAllText(encryptedFilePath);
                // Convert the encrypted content based on the encoding format
                byte[] encryptedBytes = null;
                switch (encodingFormat)
                {
                    case EncodingFormatEnum.Base64:
                        encryptedBytes = Convert.FromBase64String(encryptedContent);
                        break;
                    case EncodingFormatEnum.Hex:
                        encryptedBytes = HexStringToByteArray(encryptedContent);
                        break;
                    case EncodingFormatEnum.Utf8:
                        encryptedBytes = Encoding.UTF8.GetBytes(encryptedContent);
                        break;
                }

                // Decrypt the content using AES
                var keyBytes = Encoding.UTF8.GetBytes(key);
                using (var aes = Aes.Create())
                {
                    aes.Key = keyBytes;
                    aes.GenerateIV(); // You might want to use a specific IV
                    using (var decryptor = aes.CreateDecryptor(aes.Key, aes.IV))
                    using (var msDecrypt = new MemoryStream(encryptedBytes))
                    using (var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                    using (var reader = new StreamReader(csDecrypt))
                    {
                        var decryptedContent = reader.ReadToEnd();
                        // Write the decrypted content to the output file
                        File.WriteAllText(outputFilePath, decryptedContent);

                        // Set output success
                        StatusMessage.Set(context, "File decrypted successfully.");
                        IsSuccess.Set(context, true);
                    }
                }
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error decrypting file with AES: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private byte[] HexStringToByteArray(string hexString)
        {
            var length = hexString.Length;
            if (length % 2 != 0) throw new ArgumentException("Invalid hex string", nameof(hexString));
            var bytes = new byte[length / 2];
            for (var i = 0; i < length; i += 2)
            {
                bytes[i / 2] = Convert.ToByte(hexString.Substring(i, 2), 16);
            }

            return bytes;
        }
    }
}