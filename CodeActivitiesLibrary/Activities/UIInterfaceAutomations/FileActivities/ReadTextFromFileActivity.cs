using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    [DisplayName("Read Text from File")]
    [Description("Reads all text content from the specified file.")]
    public class ReadTextFromFileActivity : CodeActivity
    {
        #region Arguments

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("File Path")]
        [Description("The full path of the file to read.")]
        public InArgument<string> FilePath { get; set; }

        [Category("Input")]
        [DisplayName("Trim Content")]
        [Description("Set to true to trim the content after reading.")]
        public InArgument<bool> TrimContent { get; set; } = new InArgument<bool>(true);

        [Category("Output")]
        [DisplayName("File Content")]
        [Description("The text content read from the file.")]
        public OutArgument<string> FileContent { get; set; }

        [Category("Output")]
        [Description("Returns a status message indicating success or error.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            var filePath = FilePath.Get(context);
            var trimContent = TrimContent.Get(context);
            string status;
            string content = string.Empty;

            try
            {
                // Validation
                if (string.IsNullOrWhiteSpace(filePath))
                    throw new ArgumentException("File path cannot be empty.");

                if (!File.Exists(filePath))
                    throw new FileNotFoundException("The specified file does not exist.", filePath);

                // Read content
                content = File.ReadAllText(filePath);

                if (trimContent)
                    content = content.Trim();

                status = $"Successfully read from file: {filePath}";
            }
            catch (Exception ex)
            {
                status = $"Error reading file: {ex.Message}";
            }

            // Set outputs
            FileContent.Set(context, content);
            StatusMessage.Set(context, status);
        }
    }
}
