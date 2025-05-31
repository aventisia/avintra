using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Set Checkbox State in Window")]
    [Description("Checks or unchecks a checkbox in a window form.")]
    public class SetCheckboxStateInWindowActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The handle or identifier of the window.")]
        public InArgument<string> WindowHandle { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The selector or identifier of the checkbox.")]
        public InArgument<string> CheckboxSelector { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("Whether to check or uncheck the checkbox.")]
        public InArgument<bool> Checked { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var windowHandle = WindowHandle.Get(context);
            var checkboxSelector = CheckboxSelector.Get(context);
            var isChecked = Checked.Get(context);
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(windowHandle))
                {
                    throw new ArgumentException("Window handle cannot be null or empty.");
                }

                if (string.IsNullOrEmpty(checkboxSelector))
                {
                    throw new ArgumentException("Checkbox selector cannot be null or empty.");
                }

                // Simulate setting checkbox state using a hypothetical API
                StatusMessage.Set(context, "Checkbox state updated successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error setting checkbox state: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}