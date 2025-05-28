using System;
using System.Activities;
using System.ComponentModel;
using System.Text.Json;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Convert JSON to Custom Object")]
    [Description("Converts a JSON string into a custom object.")]
    public class ConvertJsonToCustomObjectActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("JSON Data")]
        [Description("A JSON text or variable containing JSON to convert to a custom object.")]
        public InArgument<string> JsonData { get; set; }


        [Category("Output")]
        [DisplayName("Custom Object Output")]
        [Description("The resulting custom object after converting from JSON.")]
        public OutArgument<object> JsonAsCustomObjectOutput { get; set; }


        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var jsonData = JsonData.Get(context);

                if (string.IsNullOrWhiteSpace(jsonData))
                    throw new ArgumentException("JSON data cannot be empty.");

                // Deserialize JSON to object (this will return a dynamic or object type)
                var options = new JsonSerializerOptions { WriteIndented = true };
                var jsonObject = JsonSerializer.Deserialize<object>(jsonData, options);

                JsonAsCustomObjectOutput.Set(context, jsonObject);

                status += " JSON successfully converted to custom object.";
            }
            catch (Exception ex)
            {
                status = $"Error converting JSON to custom object: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}