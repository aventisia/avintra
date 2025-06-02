using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Get Details of Element on Web Page")]
    [Description("Retrieves the value of a specified attribute from a selected UI element in a web browser.")]
    public class GetDetailsOfElementOnWebPageActivity : Extensions.BaseCodeActivity
    {
        #region Outputs

        [Category("Output")]
        [DisplayName("Attribute Value")]
        [Description("The value of the web element's attribute.")]
        public OutArgument<string> OAttributeValueOutput { get; set; }

        #endregion

        #region Status Output

        
        

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var webBrowserInstanceId = WebBrowserInstance.Get(context);
                var uiElement = UiElement.Get(context);
                var attributeName = AttributeName.Get(context);

                // Simulate retrieving attribute value
                var attributeValue = $"Simulated value for '{attributeName}'";

                OAttributeValueOutput.Set(context, attributeValue);
            }
            catch (Exception ex)
            {
                status = $"Error retrieving element details: {ex.Message}";
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
        [Description("Select the UI element on the web page to capture.")]
        public InArgument<string> UiElement { get; set; }

        [Category("Input")]
        [DisplayName("Attribute Name")]
        [Description("Enter or select the attribute whose value to retrieve.")]
        [DefaultValue("Own Text")]
        public InArgument<string> AttributeName { get; set; }

        #endregion
    }
}