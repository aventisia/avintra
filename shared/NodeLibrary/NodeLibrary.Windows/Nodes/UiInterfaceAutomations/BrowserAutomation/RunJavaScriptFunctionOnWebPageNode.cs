using OpenQA.Selenium;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("Run JavaScript Function on Web Page"), Description("Executes a custom JavaScript function in the context of the current web page.")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg")]
public class RunJavaScriptFunctionOnWebPageNode : BaseNode
{
    [DisplayName("Web Browser Instance"), Description("Enter or choose the variable that contains the web browser instance to work with.")]
    public required InArgument<IWebDriver> WebBrowserInstance { get; set; }

    [DisplayName("JavaScript Function"), Description("The JavaScript function to execute (e.g., 'return document.title').")]
    public required InArgument<string> JavaScriptFunction { get; set; }

    [DisplayName("Arguments"), Description("Optional arguments to pass to the script function.")]
    public InArgument<object[]> ScriptArguments { get; set; } = new InArgument<object[]>(Array.Empty<object>());

    [DisplayName("Timeout Seconds"), Description("Maximum time in seconds to wait for script execution before failing.")]
    public InArgument<int> TimeoutSeconds { get; set; } = new InArgument<int>(60);

    [DisplayName("Result Output"), Description("Returns the result of the JavaScript execution, if any.")]
    public OutArgument<object> Result { get; set; } = new OutArgument<object>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        object? result = null;

        try
        {
            var driver = WebBrowserInstance.Get(context);
            var script = JavaScriptFunction.Get(context);
            var args = ScriptArguments.Get(context) ?? Array.Empty<object>();
            var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));

            if (driver == null)
                throw new ArgumentException("Web browser instance cannot be null.");

            if (string.IsNullOrWhiteSpace(script))
                throw new ArgumentException("JavaScript function cannot be empty.");

            var jsExecutor = driver as IJavaScriptExecutor
                ?? throw new InvalidOperationException("Current driver does not support JavaScript execution.");

            driver.Manage().Timeouts().AsynchronousJavaScript = timeout;

            result = jsExecutor.ExecuteScript(script, args);

            var scriptPreview = script.Length > 30 ? script[..30] + "..." : script;
            status = $"Successfully executed JavaScript: '{scriptPreview}'";

            Result.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error running JavaScript: {ex.Message}";
            Result.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
    }
}
