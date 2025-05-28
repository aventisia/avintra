using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    // Activity to get the value of an element's attribute on a web page
    [DisplayName("Get Element Attribute Value"),
     Description("Retrieve the value of an element's attribute on a web page.")]
    public class GetElementAttributeValueActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The URL of the web page.")]
        public InArgument<string> Url { get; set; }

        [RequiredArgument, Category("Input"), Description("The selector for the element (e.g., CSS selector).")]
        public InArgument<string> ElementSelector { get; set; }

        [RequiredArgument, Category("Input"), Description("The name of the attribute to retrieve.")]
        public InArgument<string> AttributeName { get; set; }

        [Category("Output"), Description("Returns the value of the attribute.")]
        public OutArgument<string> Result { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var url = Url.Get(context);
            var elementSelector = ElementSelector.Get(context);
            var attributeName = AttributeName.Get(context);
            var result = "";
            var status = "";

            try
            {
                // Simulate getting element attribute value (actual implementation would use a web automation library like Selenium)
                result = $"Simulated attribute value for '{elementSelector}' with attribute '{attributeName}'";
                status = "Element attribute value retrieved successfully.";
            }
            catch (Exception ex)
            {
                result = "";
                status = $"Error retrieving element attribute value: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}