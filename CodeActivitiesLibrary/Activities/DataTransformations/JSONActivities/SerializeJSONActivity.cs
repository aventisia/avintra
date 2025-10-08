using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.JSONActivities
{
    [DisplayName("Serialize JSON Token")]
    [Description("Converts a JToken or object into both JSON string and JToken.")]
    public class SerializeJSONActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Input Token")]
        [Description("The JToken or object to serialize into JSON text.")]
        public InArgument<JToken> InputToken { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("Serialized JSON")]
        [Description("The resulting JSON string from serialization. Returns null if serialization failed.")]
        public OutArgument<string> SerializedJson { get; set; }

        [DisplayName("Serialized Token")]
        [Description("The resulting JToken from serialization. Returns null if serialization failed.")]
        public OutArgument<JToken> SerializedToken { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var token = InputToken.Get(context);

                if (token == null)
                {
                    SerializedJson.Set(context, null);
                    SerializedToken.Set(context, null);
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Input token is null. Cannot serialize.");
                    return;
                }

                // Serialize with indentation for readability
                string serializedJson = JsonConvert.SerializeObject(token, Formatting.Indented);

                // Parse back into JToken to give both outputs
                JToken serializedToken = JToken.Parse(serializedJson);

                SerializedJson.Set(context, serializedJson);
                SerializedToken.Set(context, serializedToken);

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Successfully serialized JToken into JSON string and JToken.");
            }
            catch (Exception ex)
            {
                SerializedJson.Set(context, null);
                SerializedToken.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error serializing JSON: {ex.Message}");
            }
        }
    }
}
