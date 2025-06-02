using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Populate Text Field on Web Page"),
     Description("Fill in a text field on a web page with the specified text.")]
    public class PopulateTextFieldActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The URL of the web page.")]
        public InArgument<string> Url { get; set; }

        [RequiredArgument, Category("Input"),
         Description("The selector for the text field element (e.g., CSS selector).")]
        public InArgument<string> TextFieldSelector { get; set; }

        [RequiredArgument, Category("Input"), Description("The text to populate the field with.")]
        public InArgument<string> TextToPopulate { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var url = Url.Get(context);
            var textFieldSelector = TextFieldSelector.Get(context);
            var textToPopulate = TextToPopulate.Get(context);
            var status = "";

            try
            {
                // Simulate populating text field (actual implementation would use a web automation library like Selenium)
                status = $"Simulated text '{textToPopulate}' populated in element '{textFieldSelector}'";
            }
            catch (Exception ex)
            {
                status = $"Error populating text field: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}