using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.JSONActivities
{
    [DisplayName("Deserialize JSON Text")]
    [Description("Parses a JSON string into a JToken object.")]

    public class DeserializeJSONTextActivity : BaseCodeActivity
    {
        // Input Arguments
        [RequiredArgument]
        [DisplayName("JSON Text")]
        [Description("The JSON string to parse into a JToken structure.")]
        public InArgument<string> JsonText { get; set; }

        // Output Arguments
        
        [DisplayName("Deserialized Token")]
        [Description("The resulting JToken from the deserialization. Returns null if parsing failed.")]
        public OutArgument<JToken> DeserializedToken { get; set; }

        [DisplayName("Deserialized JSON")]
        [Description("The resulting JSON string from the deserialization. Returns null if parsing failed.")]
        public OutArgument<string> DeserializedJson { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string jsonText = JsonText.Get(context);
                if (string.IsNullOrWhiteSpace(jsonText))
                {
                    DeserializedToken.Set(context, null);
                    DeserializedJson.Set(context, null);
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Input JSON text is null or empty.");
                    return;
                }

                JToken token = JToken.Parse(jsonText);
                string deserializedJson = JsonConvert.SerializeObject(token, Formatting.Indented);
                DeserializedToken.Set(context, token);
                DeserializedJson.Set(context, deserializedJson);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Successfully parsed JSON text into JToken.");
            }
            catch (Exception ex)
            {
                DeserializedToken.Set(context, null);
                DeserializedJson.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error deserializing JSON: {ex.Message}");
            }
        }
    }
}