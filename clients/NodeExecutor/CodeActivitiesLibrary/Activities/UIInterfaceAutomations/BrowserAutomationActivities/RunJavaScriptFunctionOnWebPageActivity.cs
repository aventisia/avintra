using CodeActivitiesLibrary.Extensions;
using OpenQA.Selenium;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Run JavaScript Function on Web Page")]
    [Description("Executes a custom JavaScript function in the context of the current web page.")]
    [ActivityMetaData(nodeImg: "/assets/BrowserAutomation.svg")]
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
            "The JavaScript function to execute (e.g., 'document.getElementById(\"myId\").value = \"test\";' or 'return document.title')")]
        public InArgument<string> JavaScriptFunction { get; set; }

        [DisplayName("Arguments")]
        [Description("Optional arguments to pass to the script function.")]
        public InArgument<object[]> ScriptArguments { get; set; }

        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds to wait for script execution before failing.")]
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
                var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));

                if (driver == null)
                    throw new ArgumentException("Web browser instance cannot be null.");

                if (string.IsNullOrWhiteSpace(script))
                    throw new ArgumentException("JavaScript function cannot be empty.");

                var jsExecutor = driver as IJavaScriptExecutor
                                 ?? throw new InvalidOperationException(
                                     "Current driver does not support JavaScript execution.");

                // Set script timeout
                driver.Manage().Timeouts().AsynchronousJavaScript = timeout;

                // Execute the script
                result = jsExecutor.ExecuteScript(script, args);

                var scriptPreview = script.Length > 30 ? script.Substring(0, 30) + "..." : script;
                status = $"Successfully executed JavaScript: '{scriptPreview}'";

                Result.Set(context, result);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error running JavaScript: {ex.Message}";
                result = null;
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}