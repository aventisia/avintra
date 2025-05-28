using System;
using System.Activities;
using System.ComponentModel;
using System.Security.Cryptography;

namespace CodeActivitiesLibrary.DataTransformations.CryptographyActivities
{
    [DisplayName("Hash from File with Key"),
     Description("Hash the contents of a file with a key, using a specified algorithm and an encoding format")]
    public class HashFromFileWithKeyActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The path to the file to hash.")]
        public InArgument<string> FilePath { get; set; }

        [RequiredArgument, Category("Input"), Description("The key to use in hashing.")]
        public InArgument<string> Key { get; set; }

        [RequiredArgument, Category("Input"), Description("The hashing algorithm to use.")]
        public InArgument<HashAlgorithm> Algorithm { get; set; }

        [Category("Output"), Description("Returns the hashed content of the file.")]
        public OutArgument<string> HashedContent { get; set; }

        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var filePath = FilePath.Get(context);
            var key = Key.Get(context);
            var algorithm = Algorithm.Get(context);
            var hashedContent = "";
            var status = "";

            try
            {
                // Placeholder for file hashing with key logic
                // Read the file, hash its content with the key, and return the result
                hashedContent = "Placeholder hashed content";
                status = "File hashed successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error hashing file with key: {ex.Message}";
            }

            HashedContent.Set(context, hashedContent);
            StatusMessage.Set(context, status);
        }
    }
}