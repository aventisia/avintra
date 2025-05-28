using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    [DisplayName("Convert File to Binary Data"), Description("Converts a file to binary data.")]
    public class ConvertFileToBinaryDataActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The full path of the file to convert.")]
        public InArgument<string> FilePath { get; set; }

        [Category("Output"), Description("Returns the binary data of the file.")]
        public OutArgument<byte[]> BinaryData { get; set; }

        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var filePath = FilePath.Get(context);
            byte[] binaryData = null;
            var status = "";

            try
            {
                if (!File.Exists(filePath))
                    throw new ArgumentException($"File not found: {filePath}");

                binaryData = File.ReadAllBytes(filePath);
                status = "File converted to binary data successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error converting file to binary data: {ex.Message}";
            }

            BinaryData.Set(context, binaryData);
            StatusMessage.Set(context, status);
        }
    }
}