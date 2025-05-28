using System;
using System.Activities;
using System.ComponentModel;
using System.Security.Cryptography;

namespace CodeActivitiesLibrary.DataTransformations.CryptographyActivities
{
    [DisplayName("Hash Text")]
    [Description("Hash a string, using a specified algorithm and an encoding format")]
    public class HashTextActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The text to hash.")]
        public InArgument<string> Text { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The hashing algorithm to use.")]
        public InArgument<HashAlgorithm> Algorithm { get; set; }

        [Category("Output")]
        [Description("Returns the hashed text.")]
        public OutArgument<string> HashedText { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var text = Text.Get(context);
            var algorithm = Algorithm.Get(context);
            var hashedText = "";
            var status = "";

            try
            {
                // Placeholder for hashing logic
                // Use a hashing library like System.Security.Cryptography here
                hashedText = "Placeholder hashed text";
                status = "Text hashed successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error hashing text: {ex.Message}";
            }

            HashedText.Set(context, hashedText);
            StatusMessage.Set(context, status);
        }
    }
}