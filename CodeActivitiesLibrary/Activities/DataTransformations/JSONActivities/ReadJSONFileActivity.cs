using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
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
        [RequiredArgument]
        [DisplayName("File Path")]
        [Description("The full path to the JSON file to be read.")]
        public InArgument<string> FilePath { get; set; }

        [DisplayName("JSON Content (String)")]
        [Description(
            "The content of the JSON file as a string. Returns \"null\" if an error occurred while reading the file.")]
        public OutArgument<string> JsonContentString { get; set; }

        [DisplayName("JSON Content (JToken)")]
        [Description(
            "The content of the JSON file as a JToken. Returns null if an error occurred while reading the file.")]
        public OutArgument<JToken> JsonContentToken { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string filePath = FilePath.Get(context);
                if (string.IsNullOrWhiteSpace(filePath))
                {
                    JsonContentString.Set(context, "null");
                    JsonContentToken.Set(context, null);
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "File path is null or empty.");
                    return;
                }

                   // Check if file exists
                if (!File.Exists(filePath))
                {
                    JsonContentString.Set(context, "null");
                    JsonContentToken.Set(context, null);
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, $"File not found: {filePath}");
                    return;
                }

                  // Read file content
                string content = File.ReadAllText(filePath);
                JToken jToken = JToken.Parse(content);
                JsonContentString.Set(context, content);
                JsonContentToken.Set(context, jToken);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully read JSON file: {filePath}");
            }
            catch (Exception ex)
            {
                JsonContentString.Set(context, "null");
                JsonContentToken.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error reading JSON file: {ex.Message}");
            }
        }
    }
}