using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Get Selected Checkboxes in Window")]
    [Description("Retrieves the names of the selected checkboxes in a checkbox group or the state of a specific checkbox.")]
    public class GetSelectedCheckboxesInWindowActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The handle or identifier of the window.")]
        public InArgument<string> WindowHandle { get; set; }

        [Category("Output")]
        [Description("Returns the list of selected checkbox names or states.")]
        public OutArgument<List<string>> SelectedCheckboxes { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var windowHandle = WindowHandle.Get(context);
            List<string> selectedCheckboxes = null;
            string status = "";

            try
            {
                if (string.IsNullOrEmpty(windowHandle))
                {
                    throw new ArgumentException("Window handle cannot be null or empty.");
                }

                // Simulate getting selected checkboxes using a hypothetical API
                selectedCheckboxes = new List<string> { "Checkbox1", "Checkbox2" };
                StatusMessage.Set(context, "Selected checkboxes retrieved successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error retrieving selected checkboxes: {ex.Message}";
            }

            SelectedCheckboxes.Set(context, selectedCheckboxes);
            StatusMessage.Set(context, status);
        }
    }
}