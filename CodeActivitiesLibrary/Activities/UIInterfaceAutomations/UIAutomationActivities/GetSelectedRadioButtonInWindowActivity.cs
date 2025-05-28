using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Get Selected Radio Button in Window")]
    [Description("Retrieves the names of the selected radio button in a radio button group or the state of a specific radio button.")]
    public class GetSelectedRadioButtonInWindowActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The handle or identifier of the window.")]
        public InArgument<string> WindowHandle { get; set; }

        [Category("Output")]
        [Description("Returns the name or state of the selected radio button.")]
        public OutArgument<string> SelectedRadioButton { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var windowHandle = WindowHandle.Get(context);
            string selectedRadioButton = null;
            string status = "";

            try
            {
                if (string.IsNullOrEmpty(windowHandle))
                {
                    throw new ArgumentException("Window handle cannot be null or empty.");
                }

                // Simulate getting selected radio button using a hypothetical API
                selectedRadioButton = "RadioButton1";
                StatusMessage.Set(context, "Selected radio button retrieved successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error retrieving selected radio button: {ex.Message}";
            }

            SelectedRadioButton.Set(context, selectedRadioButton);
            StatusMessage.Set(context, status);
        }
    }
}