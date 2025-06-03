using System;
using System.Activities;
using System.ComponentModel;


namespace CodeActivitiesLibrary.DataTransformations.CryptographyActivities
{
    [DisplayName("Decrypt Text with AES"),
     Description("Decrypt a string with AES based on a specified key and an encoding format")]
    public class DecryptTextWithAesActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The ciphertext to decrypt.")]
        public InArgument<string> Ciphertext { get; set; }

        [RequiredArgument, Category("Input"), Description("The decryption key.")]
        public InArgument<string> Key { get; set; }

        [RequiredArgument, Category("Input"), Description("The encoding format of the ciphertext.")]
        public InArgument<EncodingFormat> EncodingFormat { get; set; }

        [Category("Output"), Description("Returns the decrypted text.")]
        public OutArgument<string> DecryptedText { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var ciphertext = Ciphertext.Get(context);
            var key = Key.Get(context);
            var encodingFormat = EncodingFormat.Get(context);
            var decryptedText = "";
            var status = "";

            try
            {
                // Placeholder for AES decryption logic
                // Use a cryptography library like System.Security.Cryptography here
                decryptedText = "Placeholder decrypted text";
                status = "Text decrypted successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error decrypting text with AES: {ex.Message}";
            }

            DecryptedText.Set(context, decryptedText);
            StatusMessage.Set(context, status);
        }
    }
}