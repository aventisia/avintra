using OpenQA.Selenium;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("Get Details of Web Page"), Description("Retrieves specific information about a web page such as title, description, URL, or source code.")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg")]
public class GetDetailsOfWebPageNode : BaseNode
{
    [DisplayName("Web Browser Instance"), Description("Enter or choose the variable that contains the web browser instance to work with.")]
    public required InArgument<IWebDriver> WebBrowserInstance { get; set; }

    [DisplayName("Detail Type"), Description("Specifies which detail to retrieve from the web page.")]
    public InArgument<WebPageDetailTypeEnum> DetailType { get; set; } = new InArgument<WebPageDetailTypeEnum>(WebPageDetailTypeEnum.WebPageTitle);

    [DisplayName("Web Page Property"), Description("The value retrieved from the web page based on the selected detail type.")]
    public OutArgument<string> OWebPagePropertyOutput { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        string? result = null;

        try
        {
            var driver = WebBrowserInstance.Get(context);
            var detailType = DetailType.Get(context);

            if (driver == null)
                throw new ArgumentException("Web browser instance cannot be null.");

            result = detailType switch
            {
                WebPageDetailTypeEnum.WebPageDescription => driver.FindElement(By.CssSelector("meta[name='description']"))?.GetAttribute("content"),
                WebPageDetailTypeEnum.WebPageMetaKeywords => driver.FindElement(By.CssSelector("meta[name='keywords']"))?.GetAttribute("content"),
                WebPageDetailTypeEnum.WebPageTitle => driver.Title,
                WebPageDetailTypeEnum.WebPageText => driver.FindElement(By.TagName("body"))?.Text,
                WebPageDetailTypeEnum.WebPageSource => driver.PageSource,
                WebPageDetailTypeEnum.CurrentUrlAddress => driver.Url,
                _ => throw new ArgumentOutOfRangeException(nameof(detailType), "Unsupported detail type.")
            };

            OWebPagePropertyOutput.Set(context, result);
            status = $"Successfully retrieved '{detailType}' from the current web page.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error retrieving web page details: {ex.Message}";
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
    }
}

public enum WebPageDetailTypeEnum
{
    [Display(Name = "Web Page Description", Description = "Gets the meta description of the web page.")]
    WebPageDescription,

    [Display(Name = "Web Page Meta Keywords", Description = "Gets the meta keywords of the web page.")]
    WebPageMetaKeywords,

    [Display(Name = "Web Page Title", Description = "Gets the title of the web page.")]
    WebPageTitle,

    [Display(Name = "Web Page Text", Description = "Gets the visible text content of the web page.")]
    WebPageText,

    [Display(Name = "Web Page Source", Description = "Gets the full HTML source of the web page.")]
    WebPageSource,

    [Display(Name = "Current URL Address", Description = "Gets the current URL address of the browser.")]
    CurrentUrlAddress
}
