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
    [DisplayName("Encrypt from File with AES")]
    [Description("Encrypt the contents of a file with AES, using a key and a specified encoding format")]
    public class EncryptFromFileWithAesActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Input File Path")]
        [Description("The path to the input file.")]
        public InArgument<string> InputFilePath { get; set; }

        [RequiredArgument]
        [DisplayName("Encryption Key")]
        [Description("The encryption key.")]
        public InArgument<string> Key { get; set; }

        [RequiredArgument]
        [DisplayName("Encoding Format")]
        [Description("The encoding format for the encrypted content.")]
        public InArgument<EncodingFormatEnum> EncodingFormat { get; set; }

        [RequiredArgument]
        [DisplayName("Output File Path")]
        [Description("The path to the output file.")]
        public InArgument<string> OutputFilePath { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var inputFilePath = InputFilePath.Get(context);
            var key = Key.Get(context);
            var encodingFormat = EncodingFormat.Get(context);
            var outputFilePath = OutputFilePath.Get(context);
            try
            {
                // Read the input file
                var content = File.ReadAllText(inputFilePath);
                // Encrypt the content using AES
                var keyBytes = Encoding.UTF8.GetBytes(key);
                var encryptedBytes = Encrypt(content, keyBytes);
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
                    case EncodingFormatEnum.Utf8:
                        encryptedContent =
                            Convert.ToBase64String(
                                encryptedBytes); // UTF8 isn't typically used for encrypted data; Base64 is safer
                        break;
                }

                // Write the encrypted content to the output file
                File.WriteAllText(outputFilePath, encryptedContent);
                // Set output success
                StatusMessage.Set(context, "File encrypted successfully.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error encrypting file with AES: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private byte[] Encrypt(string content, byte[] key)
        {
            using (var aes = Aes.Create())
            {
                aes.Key = key;
                aes.GenerateIV(); // Generate a random IV
                var iv = aes.IV;
                var contentBytes = Encoding.UTF8.GetBytes(content);
                using (var encryptor = aes.CreateEncryptor(aes.Key, aes.IV))
                using (var msEncrypt = new MemoryStream())
                {
                    using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    using (var writer = new StreamWriter(csEncrypt))
                    {
                        writer.Write(content);
                    }

                    var encryptedBytes = msEncrypt.ToArray();
                    var finalEncryptedBytes = new byte[iv.Length + encryptedBytes.Length];
                    Array.Copy(iv, 0, finalEncryptedBytes, 0, iv.Length);
                    Array.Copy(encryptedBytes, 0, finalEncryptedBytes, iv.Length, encryptedBytes.Length);
                    return finalEncryptedBytes;
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