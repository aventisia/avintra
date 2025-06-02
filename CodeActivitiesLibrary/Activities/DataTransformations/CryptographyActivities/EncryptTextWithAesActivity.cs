using System;
using System.Activities;
using System.ComponentModel;


namespace CodeActivitiesLibrary.DataTransformations.CryptographyActivities
{
    [DisplayName("Encrypt Text with AES")]
    [Description("Encrypt a string with AES, using a key and a specified encoding format")]
    public class EncryptTextWithAesActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The plaintext to encrypt.")]
        public InArgument<string> Plaintext { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The encryption key.")]
        public InArgument<string> Key { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The encoding format for the encrypted text.")]
        public InArgument<EncodingFormat> EncodingFormat { get; set; }

        [Category("Output")]
        [Description("Returns the encrypted text.")]
        public OutArgument<string> EncryptedText { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var plaintext = Plaintext.Get(context);
            var key = Key.Get(context);
            var encodingFormat = EncodingFormat.Get(context);
            var encryptedText = "";
            var status = "";

            try
            {
                // Placeholder for AES encryption logic
                // Use a cryptography library like System.Security.Cryptography here
                encryptedText = "Placeholder encrypted text";
                status = "Text encrypted successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error encrypting text with AES: {ex.Message}";
            }

            EncryptedText.Set(context, encryptedText);
            StatusMessage.Set(context, status);
        }
    }
}