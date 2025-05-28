using System;
using System.Activities;
using System.ComponentModel;
using System.Text.Json;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Convert Custom Object to JSON")]
    [Description("Converts a custom object into its JSON representation.")]
    public class ConvertCustomObjectToJsonActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Custom Object")]
        [Description("The custom object to convert to JSON.")]
        public InArgument<object> CustomObject { get; set; }


        [Category("Output")]
        [DisplayName("JSON Output")]
        [Description("The converted JSON string from the provided custom object.")]
        public OutArgument<string> CustomObjectAsJsonOutput { get; set; }


        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var inputObject = CustomObject.Get(context);

                if (inputObject == null)
                    throw new ArgumentNullException(nameof(CustomObject), "Custom object cannot be null.");

                // Serialize the object to JSON
                var options = new JsonSerializerOptions { WriteIndented = true };
                var jsonResult = JsonSerializer.Serialize(inputObject, options);

                CustomObjectAsJsonOutput.Set(context, jsonResult);

                status += " Custom object successfully converted to JSON.";
            }
            catch (Exception ex)
            {
                status = $"Error converting object to JSON: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}