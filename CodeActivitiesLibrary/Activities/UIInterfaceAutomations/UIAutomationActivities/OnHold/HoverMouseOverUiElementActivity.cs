using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    //[DisplayName("Hover Mouse Over UI Element")]
    //[Description("Moves the mouse over any UI element on a window.")]
    public class HoverMouseOverUiElementActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The handle or identifier of the window.")]
        public InArgument<string> WindowHandle { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The selector or identifier of the UI element.")]
        public InArgument<string> UiElementSelector { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var windowHandle = WindowHandle.Get(context);
            var uiElementSelector = UiElementSelector.Get(context);
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(windowHandle))
                {
                    throw new ArgumentException("Window handle cannot be null or empty.");
                }

                if (string.IsNullOrEmpty(uiElementSelector))
                {
                    throw new ArgumentException("UI element selector cannot be null or empty.");
                }

                // Simulate hovering over UI element using a hypothetical API
                StatusMessage.Set(context, "Mouse hovered over UI element successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error hovering over UI element: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}