using System;
using System.Activities;
using System.ComponentModel;
using System.Text.Json;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Convert JSON to Custom Object")]
    [Description("Converts a JSON string into a strongly-typed custom object.")]
    public class ConvertJsonToCustomObjectActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("JSON Data")]
        [Description("The JSON string that will be converted to a custom object.")]
        public InArgument<string> JsonData { get; set; }

        [RequiredArgument]
        [DisplayName("Target Type")]
        [Description("Specifies the type of the custom object to deserialize the JSON into.")]
        public InArgument<Type> TargetType { get; set; }

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
            var status = "Success";

            try
            {
                var jsonData = JsonData.Get(context);
                var targetType = TargetType.Get(context);

                if (string.IsNullOrWhiteSpace(jsonData))
                    throw new ArgumentException("JSON data cannot be empty.");

                if (targetType == null)
                    throw new ArgumentException("Target type must be specified for deserialization.");

                // Deserialize JSON into the specified target type
                var options = new JsonSerializerOptions { WriteIndented = true };
                var result = JsonSerializer.Deserialize(jsonData, targetType, options);

                CustomObject.Set(context, result);
            }
            catch (Exception ex)
            {
                status = $"Error converting JSON to custom object: {ex.Message}";
                CustomObject.Set(context, null);
            }

            StatusMessage.Set(context, status);
        }
    }
}