using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Populate Text Field in Window")]
    [Description("Fills a text box in a window with the specified text.")]
    public class PopulateTextFieldInWindowActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The handle or identifier of the window.")]
        public InArgument<string> WindowHandle { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The selector or identifier of the text field.")]
        public InArgument<string> TextFieldSelector { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The text to populate the text field with.")]
        public InArgument<string> TextToEnter { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var windowHandle = WindowHandle.Get(context);
            var textFieldSelector = TextFieldSelector.Get(context);
            var textToEnter = TextToEnter.Get(context);
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(windowHandle))
                {
                    throw new ArgumentException("Window handle cannot be null or empty.");
                }

                if (string.IsNullOrEmpty(textFieldSelector))
                {
                    throw new ArgumentException("Text field selector cannot be null or empty.");
                }

                if (string.IsNullOrEmpty(textToEnter))
                {
                    throw new ArgumentException("Text to enter cannot be null or empty.");
                }

                // Simulate populating text field using a hypothetical API
                StatusMessage.Set(context, "Text field populated successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error populating text field: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}