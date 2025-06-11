using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace CodeActivitiesLibrary.DataTransformations.CryptographyActivities
{
    [DisplayName("Hash from File")]
    [Description("Hash the contents of a file, using a specified algorithm")]
    public class HashFromFileActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("File Path to Hash")]
        [Description("The path to the file you want to hash")]
        public InArgument<string> FilePath { get; set; }

        [RequiredArgument]
        [DisplayName("Hashing Algorithm")]
        [Description("The algorithm to use for hashing (SHA256, SHA512, or MD5)")]
        public InArgument<HashAlgorithmEnum> Algorithm { get; set; }

        [DisplayName("Hashed File Content")]
        [Description("The hashed content of the file")]
        public OutArgument<string> HashedContent { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var filePath = FilePath.Get(context);
            var algorithm = Algorithm.Get(context);
            var hashedContent = "";
            var status = "";
            try
            {
                // Read the file
                var fileContent = File.ReadAllText(filePath);
                // Hash the content
                var contentBytes = Encoding.UTF8.GetBytes(fileContent);
                var hashedBytes = HashData(contentBytes, algorithm);
                // Convert the hashed bytes to a hexadecimal string
                hashedContent = ByteArrayToHexString(hashedBytes);
                status = "File hashed successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error hashing file: {ex.Message}";
            }

            HashedContent.Set(context, hashedContent);
            StatusMessage.Set(context, status);
        }

        private byte[] HashData(byte[] data, HashAlgorithmEnum algorithm)
        {
            switch (algorithm)
            {
                case HashAlgorithmEnum.SHA256:
                    using (var sha256 = SHA256.Create())
                    {
                        return sha256.ComputeHash(data);
                    }
                case HashAlgorithmEnum.SHA512:
                    using (var sha512 = SHA512.Create())
                    {
                        return sha512.ComputeHash(data);
                    }
                case HashAlgorithmEnum.MD5:
                    using (var md5 = MD5.Create())
                    {
                        return md5.ComputeHash(data);
                    }
                default:
                    throw new ArgumentException("Invalid algorithm");
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

        public enum HashAlgorithmEnum
        {
            [Display(Name = "SHA256", Description = "SHA256 algorithm")]
            SHA256,

            [Display(Name = "SHA512", Description = "SHA512 algorithm")]
            SHA512,

            [Display(Name = "MD5", Description = "MD5 algorithm")]
            MD5
        }
    }
}