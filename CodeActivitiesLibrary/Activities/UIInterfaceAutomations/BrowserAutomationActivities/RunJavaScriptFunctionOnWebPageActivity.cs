using CodeActivitiesLibrary.Extensions;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Run JavaScript Function on Web Page")]
    [Description("Executes a custom JavaScript function in the context of the current web page.")]
    public class RunJavaScriptFunctionOnWebPageActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<IWebDriver> WebBrowserInstance { get; set; }

        [RequiredArgument]
        [DisplayName("JavaScript Function")]
        [Description(
            "The JavaScript function to execute (e.g., 'document.getElementById(\"myId\").value = \"test\";')")]
        public InArgument<string> JavaScriptFunction { get; set; }


        [DisplayName("Arguments")]
        [Description("Optional arguments to pass to the script function.")]
        public InArgument<object[]> ScriptArguments { get; set; }


        [DisplayName("Wait for Completion")]
        [Description("If true, waits for the script to complete before continuing.")]
        [DefaultValue(true)]
        public InArgument<bool> WaitForCompletion { get; set; }


        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds to wait for script completion before failing.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutSeconds { get; set; }

        [DisplayName("Result Output")]
        [Description("Returns the result of the JavaScript execution, if any.")]
        public OutArgument<object> Result { get; set; }


        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            object result = null;

            try
            {
                var driver = WebBrowserInstance.Get(context);
                var script = JavaScriptFunction.Get(context);
                var args = ScriptArguments.Get(context) ?? new object[0];
                var waitForCompletion = WaitForCompletion.Get(context);
                var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));

                if (driver == null)
                    throw new ArgumentException("Web browser instance cannot be null.");

                if (string.IsNullOrWhiteSpace(script))
                    throw new ArgumentException("JavaScript function cannot be empty.");

                // Cast to IJavaScriptExecutor
                var jsExecutor = driver as IJavaScriptExecutor;
                if (jsExecutor == null)
                    throw new InvalidOperationException("Current driver does not support JavaScript execution.");

                // Set timeout if needed
                if (waitForCompletion && timeout.TotalSeconds > 0)
                {
                    var wait = new WebDriverWait(driver, timeout);
                    wait.Until(drv => (drv as IJavaScriptExecutor)?.ExecuteScript(
                        $"arguments[0](); return true;"));
                }

                // Execute script
                result = jsExecutor.ExecuteScript(script, args);

                status = $"Successfully executed JavaScript: '{script.Substring(0, Math.Min(30, script.Length))}...'";
            }
            catch (Exception ex)
            {
                status = $"Error running JavaScript: {ex.Message}";
                result = null;
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}