using OpenQA.Selenium;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using CodeActivitiesLibrary.Extensions;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Get Details of Web Page")]
    [Description("Retrieves specific information about a web page such as title, description, URL, or source code.")]
    public class GetDetailsOfWebPageActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<IWebDriver> WebBrowserInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Detail Type")]
        [Description("Specifies which detail to retrieve from the web page.")]
        [DefaultValue(WebPageDetailTypeEnum.WebPageTitle)]
        public InArgument<WebPageDetailTypeEnum> DetailType { get; set; }

        [DisplayName("Web Page Property")]
        [Description("The value retrieved from the web page based on the selected detail type.")]
        public OutArgument<string> OWebPagePropertyOutput { get; set; }


        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            string result = null;

            try
            {
                var driver = WebBrowserInstance.Get(context);
                var detailType = DetailType.Get(context);

                if (driver == null)
                    throw new ArgumentException("Web browser instance cannot be null.");

                switch (detailType)
                {
                    case WebPageDetailTypeEnum.WebPageDescription:
                        result = driver.FindElement(By.TagName("meta[name='description']"))?.GetAttribute("content");
                        break;

                    case WebPageDetailTypeEnum.WebPageMetaKeywords:
                        result = driver.FindElement(By.TagName("meta[name='keywords']"))?.GetAttribute("content");
                        break;

                    case WebPageDetailTypeEnum.WebPageTitle:
                        result = driver.Title;
                        break;

                    case WebPageDetailTypeEnum.WebPageText:
                        result = driver.FindElement(By.TagName("body"))?.Text;
                        break;

                    case WebPageDetailTypeEnum.WebPageSource:
                        result = driver.PageSource;
                        break;

                    case WebPageDetailTypeEnum.CurrentUrlAddress:
                        result = driver.Url;
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(detailType), "Unsupported detail type.");
                }

                status = $"Successfully retrieved '{detailType}' from the current web page.";
            }
            catch (Exception ex)
            {
                status = $"Error retrieving web page details: {ex.Message}";
            }

            OWebPagePropertyOutput.Set(context, result);
            StatusMessage.Set(context, status);
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
}