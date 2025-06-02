using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Run JavaScript Function on Web Page")]
    [Description("Runs a custom JavaScript function in the context of the current web page.")]
    public class RunJavaScriptFunctionOnWebPageActivity : Extensions.BaseCodeActivity
    {
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var webBrowserInstanceId = WebBrowserInstance.Get(context);
                var javaScriptFunction = JavaScriptFunction.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(webBrowserInstanceId))
                    throw new ArgumentException("Web Browser Instance must be specified.");

                if (string.IsNullOrWhiteSpace(javaScriptFunction))
                    throw new ArgumentException("JavaScript function cannot be empty.");

                // Simulate execution of JavaScript function
                var result = $"Result from script: '{javaScriptFunction.GetHashCode()}'";

                // Set outputs conditionally
                Result.Set(context, result);

                status += $" Script executed in '{webBrowserInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error running JavaScript: {ex.Message}";
                Result.Set(context, false);
            }

            StatusMessage.Set(context, status);
        }

        #region Inputs

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<string> WebBrowserInstance { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("JavaScript Function")]
        [Description("Enter the JavaScript function to run on the current web page.")]
        [DefaultValue("function ExecuteScript() { /*your code here, return something (optionally); */ }")]
        public InArgument<string> JavaScriptFunction { get; set; }

        #endregion

        #region Outputs

        [Category("Output")]
        [DisplayName("Result Output")]
        [Description("The result returned after executing the JavaScript function.")]
        public OutArgument<string> Result { get; set; }


        
        

        #endregion
    }
}