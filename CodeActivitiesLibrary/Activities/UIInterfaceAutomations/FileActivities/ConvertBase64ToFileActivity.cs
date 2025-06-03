using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.Text;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    [DisplayName("Convert Base64 to File")]
    [Description("Converts a Base64 encoded string to a file and saves it at the specified path.")]
    public class ConvertBase64ToFileActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Base64 Encoded Text")]
        [Description("The Base64 encoded string to be converted into a file.")]
        public InArgument<string> Base64Text { get; set; }

        [RequiredArgument]
        [DisplayName("File Path")]
        [Description("The destination file path where the decoded content will be saved.")]
        public InArgument<string> FilePath { get; set; }

        [RequiredArgument]
        [DisplayName("If File Exists")]
        [Description("Specifies the behavior when a file already exists in the destination folder.")]
        [DefaultValue(IfExistsActionEnum.DoNothing)]
        public InArgument<IfExistsActionEnum> IfExistsAction { get; set; }



        protected override void Execute(CodeActivityContext context)
        {
            var base64 = Base64Text.Get(context);
            var filePath = FilePath.Get(context);
            var ifExists = IfExistsAction.Get(context);
            string status = string.Empty;

            try
            {
                if (string.IsNullOrWhiteSpace(base64))
                    throw new ArgumentException("Base64 encoded text cannot be null or empty.");

                byte[] fileBytes = Convert.FromBase64String(base64);
                var dir = Path.GetDirectoryName(filePath);

                if (!Directory.Exists(dir))
                {
                    Directory.CreateDirectory(dir);
                }

                if (File.Exists(filePath))
                {
                    switch (ifExists)
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

                File.WriteAllBytes(filePath, fileBytes);
                status = $"File successfully created at {filePath}.";
            }
            catch (FormatException ex)
            {
                status = $"Invalid Base64 format: {ex.Message}";
            }
            catch (Exception ex)
            {
                status = $"Error saving file: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}
