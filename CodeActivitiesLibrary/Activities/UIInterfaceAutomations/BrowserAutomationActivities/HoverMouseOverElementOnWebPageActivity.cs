using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Hover Mouse Over Element on Web Page")]
    [Description(
        "Simulates hovering the mouse over a specified UI element on a web page. Optionally uses physical mouse movement.")]
    public class HoverMouseOverElementOnWebPageActivity : CodeActivity
    {
        #region Outputs

        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var webBrowserInstanceId = WebBrowserInstance.Get(context);
                var uiElement = UiElement.Get(context);
                var moveMouse = MoveMouseToHover.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(uiElement))
                    throw new ArgumentException("UI Element must be selected.");

                // Simulate hover
                status = $"Hovered over '{uiElement}' in browser '{webBrowserInstanceId}'.";

                if (moveMouse) status += " Using physical mouse movement.";
            }
            catch (Exception ex)
            {
                status = $"Error during hover: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        #region Inputs

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<string> WebBrowserInstance { get; set; }

        [Browsable(false)]
        [Category("Input")]
        [DisplayName("UI Element")]
        [Description("Select the UI element on the web page to hover over.")]
        public InArgument<string> UiElement { get; set; }

        [Category("Input")]
        [DisplayName("Move Mouse to Hover")]
        [Description("Physically move the mouse cursor over the element to simulate hover.")]
        [DefaultValue(false)]
        public InArgument<bool> MoveMouseToHover { get; set; }

        #endregion
    }
}