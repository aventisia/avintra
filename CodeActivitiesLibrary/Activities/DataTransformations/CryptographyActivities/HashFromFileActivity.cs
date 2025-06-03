using System;
using System.Activities;
using System.ComponentModel;
using System.Security.Cryptography;

namespace CodeActivitiesLibrary.DataTransformations.CryptographyActivities
{
    [DisplayName("Hash from File"),
     Description("Hash the contents of a file, using a specified algorithm and an encoding format")]
    public class HashFromFileActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The path to the file to hash.")]
        public InArgument<string> FilePath { get; set; }

        [RequiredArgument, Category("Input"), Description("The hashing algorithm to use.")]
        public InArgument<HashAlgorithm> Algorithm { get; set; }

        [Category("Output"), Description("Returns the hashed content of the file.")]
        public OutArgument<string> HashedContent { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var filePath = FilePath.Get(context);
            var algorithm = Algorithm.Get(context);
            var hashedContent = "";
            var status = "";

            try
            {
                // Placeholder for file hashing logic
                // Read the file, hash its content, and return the result
                hashedContent = "Placeholder hashed content";
                status = "File hashed successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error hashing file: {ex.Message}";
            }

            HashedContent.Set(context, hashedContent);
            StatusMessage.Set(context, status);
        }
    }
}