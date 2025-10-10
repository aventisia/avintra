using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Text.Json;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Convert JSON to Custom Object")]
    [Description("Converts a JSON string into a strongly-typed custom object.")]
    [ActivityMetaData(nodeImg: "/assets/Variables.svg")]
    
    public class ConvertJsonToCustomObjectActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("JSON Data")]
        [Description("The JSON string that will be converted to a custom object.")]
        public InArgument<string> JsonData { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("Custom Object")]
        [Description("Returns the resulting custom object after JSON deserialization.")]
        public OutArgument<object> CustomObject { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var jsonData = JsonData.Get(context);

                if (string.IsNullOrWhiteSpace(jsonData))
                    throw new ArgumentException("JSON data cannot be empty.");

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    WriteIndented = true
                };

                // Deserialize to Dictionary<string, object>
                var result = JsonSerializer.Deserialize<Dictionary<string, object>>(jsonData, options);

                CustomObject.Set(context, result);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "JSON successfully converted to object.");
            }
            catch (Exception ex)
            {
                CustomObject.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error converting JSON to object: {ex.Message}");
            }
        }
    }
}