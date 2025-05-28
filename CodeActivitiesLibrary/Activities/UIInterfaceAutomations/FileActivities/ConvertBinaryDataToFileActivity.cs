using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    [DisplayName("Convert Binary Data to File"), Description("Converts binary data back to a file.")]
    public class ConvertBinaryDataToFileActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The binary data to convert.")]
        public InArgument<byte[]> BinaryData { get; set; }

        [RequiredArgument, Category("Input"), Description("The full path where the file should be saved.")]
        public InArgument<string> FilePath { get; set; }

        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var binaryData = BinaryData.Get(context);
            var filePath = FilePath.Get(context);
            var status = "";

            try
            {
                if (binaryData == null || binaryData.Length == 0)
                    throw new ArgumentException("Binary data cannot be null or empty.");

                var dir = Path.GetDirectoryName(filePath);
                if (!Directory.Exists(dir))
                {
                    Directory.CreateDirectory(dir);
                }

                File.WriteAllBytes(filePath, binaryData);
                status = $"Binary data saved to file at {filePath}";
            }
            catch (Exception ex)
            {
                status = $"Error converting binary data to file: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}