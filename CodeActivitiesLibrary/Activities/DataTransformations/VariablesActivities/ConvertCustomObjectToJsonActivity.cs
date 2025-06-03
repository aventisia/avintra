using System;
using System.Activities;
using System.ComponentModel;
using System.Text.Json;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Convert Custom Object to JSON")]
    [Description("Converts a custom object into its JSON representation.")]
    public class ConvertCustomObjectToJsonActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]

        [DisplayName("Custom Object")]
        [Description("The custom object to convert to JSON.")]
        public InArgument<object> CustomObject { get; set; }


        [DisplayName("Pretty Print")]
        [Description("If true, formats the JSON output with indentation for better readability.")]
        [DefaultValue(true)]
        public InArgument<bool> PrettyPrint { get; set; } = new InArgument<bool>(true);

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("JSON Output")]
        [Description("The converted JSON string from the provided custom object.")]
        public OutArgument<string> JsonOutput { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var inputObject = CustomObject.Get(context);
                var prettyPrint = PrettyPrint.Get(context);

                if (inputObject == null)
                    throw new ArgumentNullException(nameof(CustomObject), "Custom object cannot be null.");

                var options = new JsonSerializerOptions();

                if (prettyPrint)
                {
                    options.WriteIndented = true;
                }

                var jsonResult = JsonSerializer.Serialize(inputObject, options);

                JsonOutput.Set(context, jsonResult);
            }
            catch (Exception ex)
            {
                status = $"Error converting object to JSON: {ex.Message}";
                JsonOutput.Set(context, null);
            }

            StatusMessage.Set(context, status);
        }
    }
}