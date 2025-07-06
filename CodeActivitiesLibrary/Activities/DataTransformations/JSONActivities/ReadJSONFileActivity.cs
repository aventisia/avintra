using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.DataTransformations.JSONActivities
{
    [DisplayName("Read JSON File")]
    [Description("Reads the contents of a JSON file from the specified file path.")]
   
    public class ReadJSONFileActivity : BaseCodeActivity
    {
        // Input Arguments

        [RequiredArgument]
        [DisplayName("File Path")]
        [Description("The full path to the JSON file to be read.")]
        public InArgument<string> FilePath { get; set; }

        // Output Arguments

        [DisplayName("JSON Content")]
        [Description("The content of the JSON file. Returns \"null\" if an error occurred while reading the file.")]
        public OutArgument<string> JsonContent { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input values
                string filePath = FilePath.Get(context);

                // Validate input
                if (string.IsNullOrWhiteSpace(filePath))
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "File path is null or empty.");
                    JsonContent.Set(context, "null");
                    return;
                }

                // Check if file exists
                if (!File.Exists(filePath))
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, $"File not found: {filePath}");
                    JsonContent.Set(context, "null");
                    return;
                }

                // Read file content
                string content = File.ReadAllText(filePath);

                // Set outputs
                JsonContent.Set(context, content);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully read JSON file: {filePath}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error reading JSON file: {ex.Message}");
                JsonContent.Set(context, "null");
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error reading JSON file: {ex.Message}");
            }
        }
    }
}