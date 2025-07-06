using CodeActivitiesLibrary.Extensions;
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

        /// <summary>
        /// The JSON string to be deserialized into a JToken.
        /// </summary>
        [RequiredArgument]
        [DisplayName("JSON Text")]
        [Description("The JSON string to parse into a JToken structure.")]       
        public InArgument<string> JsonText { get; set; }

      

        // Output Arguments

        [DisplayName("Deserialized Token")]
        [Description("The resulting JToken from the deserialization. Returns null if parsing failed.")]
        public OutArgument<JToken> DeserializedToken { get; set; }
       
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Get input
                string jsonText = JsonText.Get(context);

                // Validate input
                if (string.IsNullOrWhiteSpace(jsonText))
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Input JSON text is null or empty.");
                    DeserializedToken.Set(context, null);
                    return;
                }

                // Parse JSON
                JToken token = JToken.Parse(jsonText);

                // Set outputs
                DeserializedToken.Set(context, token);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Successfully parsed JSON text into JToken.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deserializing JSON text: {ex.Message}");
                DeserializedToken.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error deserializing JSON: {ex.Message}");
            }
        }
    }
}