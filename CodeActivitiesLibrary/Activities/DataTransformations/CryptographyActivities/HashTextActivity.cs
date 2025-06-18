using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text;

namespace CodeActivitiesLibrary.DataTransformations.CryptographyActivities
{
    [DisplayName("Hash Text")]
    [Description("Hash a string, using a specified algorithm")]
    public class HashTextActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Text to Hash")]
        [Description("The text you want to hash")]
        public InArgument<string> Text { get; set; }

        [RequiredArgument]
        [DisplayName("Hashing Algorithm")]
        [Description("The algorithm to use for hashing (SHA256, SHA512, or MD5)")]
        public InArgument<HashAlgorithmEnum> Algorithm { get; set; }

        [DisplayName("Hashed Text")]
        [Description("The hashed text")]
        public OutArgument<string> HashedText { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var text = Text.Get(context);
            var algorithm = Algorithm.Get(context);
            var hashedText = "";
            try
            {
                // Hash the text
                var textBytes = Encoding.UTF8.GetBytes(text);
                var hashedBytes = HashData(textBytes, algorithm);
                // Convert the hashed bytes to a hexadecimal string
                hashedText = ByteArrayToHexString(hashedBytes);

                HashedText.Set(context, hashedText);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Text hashed successfully.");

            }
            catch (Exception ex)
            {
                HashedText.Set(context, hashedText);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error hashing text: {ex.Message}");

            }
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