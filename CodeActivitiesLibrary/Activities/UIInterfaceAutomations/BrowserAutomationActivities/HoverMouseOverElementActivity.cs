using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    // Activity to hover mouse over an element on a web page
    [DisplayName("Hover Mouse Over Element on Web Page"),
     Description("Move the mouse cursor over an element on a web page.")]
    public class HoverMouseOverElementActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The URL of the web page.")]
        public InArgument<string> Url { get; set; }

        [RequiredArgument, Category("Input"),
         Description("The selector for the element to hover over (e.g., CSS selector).")]
        public InArgument<string> ElementSelector { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var url = Url.Get(context);
            var elementSelector = ElementSelector.Get(context);
            var status = "";

            try
            {
                // Simulate hovering over an element (actual implementation would use a web automation library like Selenium)
                status = $"Simulated hover over element '{elementSelector}'";
            }
            catch (Exception ex)
            {
                status = $"Error hovering over element: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}