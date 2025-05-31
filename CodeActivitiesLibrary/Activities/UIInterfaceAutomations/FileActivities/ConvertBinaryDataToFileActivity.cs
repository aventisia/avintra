using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    [DisplayName("Convert Binary Data to File")]
    [Description("Converts binary data to a file at the specified path.")]
    public class ConvertBinaryDataToFileActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Binary Data")]
        [Description("The binary data to convert.")]
        public InArgument<byte[]> BinaryData { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("File Path")]
        [Description("The full path where the file should be saved.")]
        public InArgument<string> FilePath { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("If File Exists")]
        [Description("Specifies the behavior when a file already exists in the destination folder.")]
        [DefaultValue(IfExistsActionEnum.DoNothing)]
        public InArgument<IfExistsActionEnum> IfExistsAction { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var binaryData = BinaryData.Get(context);
            var filePath = FilePath.Get(context);
            var ifExistsAction = IfExistsAction.Get(context);
            string status;

            try
            {
                if (binaryData == null || binaryData.Length == 0)
                    throw new ArgumentException("Binary data cannot be null or empty.");

                var dir = Path.GetDirectoryName(filePath);
                if (!Directory.Exists(dir))
                {
                    Directory.CreateDirectory(dir);
                }

                if (File.Exists(filePath))
                {
                    switch (ifExistsAction)
                    {
                        case IfExistsActionEnum.DoNothing:
                            status = $"File already exists at {filePath}. No action was taken.";
                            StatusMessage.Set(context, status);
                            return;
                        case IfExistsActionEnum.Overwrite:
                            // continue to overwrite below
                            break;
                    }
                }

                File.WriteAllBytes(filePath, binaryData);
                status = $"Binary data successfully saved to file at {filePath}.";
            }
            catch (Exception ex)
            {
                status = $"Error converting binary data to file: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }

}