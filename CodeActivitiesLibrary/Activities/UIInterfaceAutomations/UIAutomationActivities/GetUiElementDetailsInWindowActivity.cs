using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Get Details of UI Element in Window")]
    [Description("Gets the value of a UI element's attribute in a window.")]
    public class GetUiElementDetailsInWindowActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The handle or identifier of the window.")]
        public InArgument<string> WindowHandle { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The selector or identifier of the UI element.")]
        public InArgument<string> ElementSelector { get; set; }

        [Category("Output")]
        [Description("Returns the details of the UI element (e.g., attribute value).")]
        public OutArgument<string> ElementDetails { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var windowHandle = WindowHandle.Get(context);
            var elementSelector = ElementSelector.Get(context);
            string elementDetails = null;
            string status = "";

            try
            {
                if (string.IsNullOrEmpty(windowHandle))
                {
                    throw new ArgumentException("Window handle cannot be null or empty.");
                }

                if (string.IsNullOrEmpty(elementSelector))
                {
                    throw new ArgumentException("Element selector cannot be null or empty.");
                }

                // Simulate getting UI element details using a hypothetical API
                elementDetails = $"Element Value: {elementSelector}";
                StatusMessage.Set(context, "UI element details retrieved successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error retrieving UI element details: {ex.Message}";
            }

            ElementDetails.Set(context, elementDetails);
            StatusMessage.Set(context, status);
        }
    }
}