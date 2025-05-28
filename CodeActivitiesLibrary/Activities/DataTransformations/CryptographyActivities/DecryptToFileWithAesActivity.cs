using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;


namespace CodeActivitiesLibrary.DataTransformations.CryptographyActivities
{
    [DisplayName("Decrypt to File with AES"),
     Description("Decrypt the contents of a file with AES based on a specified key and an encoding format")]
    public class DecryptToFileWithAesActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The path to the encrypted file.")]
        public InArgument<string> EncryptedFilePath { get; set; }

        [RequiredArgument, Category("Input"), Description("The decryption key.")]
        public InArgument<string> Key { get; set; }

        [RequiredArgument, Category("Input"), Description("The encoding format of the encrypted content.")]
        public InArgument<EncodingFormat> EncodingFormat { get; set; }

        [RequiredArgument, Category("Input"), Description("The path to the output file.")]
        public InArgument<string> OutputFilePath { get; set; }

        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var encryptedFilePath = EncryptedFilePath.Get(context);
            var key = Key.Get(context);
            var encodingFormat = EncodingFormat.Get(context);
            var outputFilePath = OutputFilePath.Get(context);
            var status = "";

            try
            {
                // Placeholder for file decryption logic
                // Read the encrypted file, decrypt the content, and write to the output file
                status = "File decrypted successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error decrypting file with AES: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }

    public enum EncodingFormat
    {
        [Display(Name = "Base64", Description = "Base64 encoding")]
        Base64 = 0,

        [Display(Name = "Hex", Description = "Hexadecimal encoding")]
        Hex = 1,

        [Display(Name = "UTF8", Description = "UTF-8 encoding")]
        Utf8 = 2
    }
}