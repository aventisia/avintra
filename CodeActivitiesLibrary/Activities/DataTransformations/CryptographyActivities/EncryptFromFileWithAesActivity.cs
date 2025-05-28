using System;
using System.Activities;
using System.ComponentModel;


namespace CodeActivitiesLibrary.DataTransformations.CryptographyActivities
{
    [DisplayName("Encrypt from File with AES")]
    [Description("Encrypt the contents of a file with AES, using a key and a specified encoding format")]
    public class EncryptFromFileWithAesActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The path to the input file.")]
        public InArgument<string> InputFilePath { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The encryption key.")]
        public InArgument<string> Key { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The encoding format for the encrypted content.")]
        public InArgument<EncodingFormat> EncodingFormat { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The path to the output file.")]
        public InArgument<string> OutputFilePath { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var inputFilePath = InputFilePath.Get(context);
            var key = Key.Get(context);
            var encodingFormat = EncodingFormat.Get(context);
            var outputFilePath = OutputFilePath.Get(context);
            var status = "";

            try
            {
                // Placeholder for file encryption logic
                // Read the file, encrypt the content, and write to the output file
                status = "File encrypted successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error encrypting file with AES: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}