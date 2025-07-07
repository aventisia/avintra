using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.Collections;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.DataTransformations.JSONActivities
{
    [DisplayName("Write Text to JSON File")]
    [Description("Writes the provided content as JSON to the specified file path.")]
    public class WriteTextToJSONFileActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("JSON Content")]
        [Description("The content to write as JSON. Can be a string, object, array, JObject, JArray, List, Dictionary, etc.")]
        public InArgument<object> JsonContent { get; set; }

        [RequiredArgument]
        [DisplayName("File Path")]
        [Description("The full path to the file where the JSON content will be written.")]
        public InArgument<string> FilePath { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                object input = JsonContent.Get(context);
                string filePath = FilePath.Get(context);

                if (string.IsNullOrWhiteSpace(filePath))
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "File path is null or empty.");
                    return;
                }

                if (input == null)
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "JSON content is null.");
                    return;
                }

                string jsonContent;

                switch (input)
                {
                    case string str:
                        // Try to parse as JSON, if valid, write as-is; else, serialize as JSON string
                        try
                        {
                            JToken.Parse(str);
                            jsonContent = str;
                        }
                        catch
                        {
                            jsonContent = JsonConvert.SerializeObject(str, Formatting.Indented);
                        }
                        break;

                    case JToken jtoken:
                        jsonContent = jtoken.ToString(Formatting.Indented);
                        break;

                    case IEnumerable enumerable when !(input is string):
                        jsonContent = JsonConvert.SerializeObject(enumerable, Formatting.Indented);
                        break;

                    case ValueType valuetype:
                        jsonContent = JsonConvert.SerializeObject(valuetype, Formatting.Indented);
                        break;

                    default:
                        jsonContent = JsonConvert.SerializeObject(input, Formatting.Indented);
                        break;
                }

                // Ensure directory exists
                string directory = Path.GetDirectoryName(filePath);
                if (!Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                File.WriteAllText(filePath, jsonContent);

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully wrote JSON to file: {filePath}");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error writing JSON file: {ex.Message}");
            }
        }
    }
}