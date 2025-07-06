using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.DataTransformations.JSONActivities
{
    [DisplayName("Write Text to JSON File")]
    [Description("Writes the provided JSON string to the specified file path.")]
  
    public class WriteTextToJSONFileActivity : BaseCodeActivity
    {
        // Input Arguments
   
        [RequiredArgument]
        [DisplayName("JSON Content")]
        [Description("The JSON string to write to the file.")]
        public InArgument<string> JsonContent { get; set; }

        [RequiredArgument]
        [DisplayName("File Path")]
        [Description("The full path to the file where the JSON content will be written.")]
        public InArgument<string> FilePath { get; set; }

        // Output Arguments

        [DisplayName("Written Content")]
        [Description("The JSON content that was successfully written to the file.")]
        public OutArgument<string> WrittenContent { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Get input values
                string jsonContent = JsonContent.Get(context);
                string filePath = FilePath.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(filePath))
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "File path is null or empty.");
                    WrittenContent.Set(context, null);
                    return;
                }

                if (jsonContent == null)
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "JSON content is null.");
                    WrittenContent.Set(context, null);
                    return;
                }

                // Ensure directory exists
                string directory = Path.GetDirectoryName(filePath);
                if (!Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                // Write JSON content to file
                File.WriteAllText(filePath, jsonContent);

                // Set outputs
                WrittenContent.Set(context, jsonContent);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully wrote JSON to file: {filePath}");
               
            }
            catch (Exception ex)
            {              
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error writing JSON file: {ex.Message}");
                WrittenContent.Set(context, null);
            }
        }
    }
}