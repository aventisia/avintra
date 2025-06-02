using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;


namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Get Details of Web Page")]
    [Description("Retrieves specific information about a web page such as title, description, URL, or source code.")]
    public class GetDetailsOfWebPageActivity : Extensions.BaseCodeActivity
    {
        #region Outputs

        [Category("Output")]
        [DisplayName("Web Page Property")]
        [Description("The value retrieved from the web page based on the selected detail type.")]
        public OutArgument<string> OWebPagePropertyOutput { get; set; }

        #endregion

        #region Status Output

        
        

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var webBrowserInstanceId = WebBrowserInstance.Get(context);
                var detailType = Get.Get(context);

                // Simulate retrieving data from the web page
                string result;
                switch (detailType)
                {
                    case WebPageDetailTypeEnum.WebPageDescription:
                        result = "Simulated meta description.";
                        break;
                    case WebPageDetailTypeEnum.WebPageMetaKeywords:
                        result = "keyword1, keyword2, keyword3";
                        break;
                    case WebPageDetailTypeEnum.WebPageTitle:
                        result = "Simulated Web Page Title";
                        break;
                    case WebPageDetailTypeEnum.WebPageText:
                        result = "This is the visible text content of the page.";
                        break;
                    case WebPageDetailTypeEnum.WebPageSource:
                        result = "<html><body>Simulated HTML source</body></html>";
                        break;
                    case WebPageDetailTypeEnum.CurrentUrlAddress:
                        result = "https://example.com/page?query=1 ";
                        break;
                    default:
                        throw new ArgumentOutOfRangeException();
                }

                OWebPagePropertyOutput.Set(context, result);
            }
            catch (Exception ex)
            {
                status = $"Error retrieving web page details: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        #region Inputs

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<string> WebBrowserInstance { get; set; }

        [Category("Input")]
        [DisplayName("Get")]
        [Description("Select what detail you want to retrieve from the web page.")]
        [DefaultValue(WebPageDetailTypeEnum.WebPageDescription)]
        public InArgument<WebPageDetailTypeEnum> Get { get; set; }

        #endregion
    }

    public enum WebPageDetailTypeEnum
    {
        [Display(Name = "Web Page Description", Description = "Gets the meta description of the web page.")]
        WebPageDescription = 0,

        [Display(Name = "Web Page Meta Keywords", Description = "Gets the meta keywords of the web page.")]
        WebPageMetaKeywords = 1,

        [Display(Name = "Web Page Title", Description = "Gets the title of the web page.")]
        WebPageTitle = 2,

        [Display(Name = "Web Page Text", Description = "Gets the visible text content of the web page.")]
        WebPageText = 3,

        [Display(Name = "Web Page Source", Description = "Gets the full HTML source of the web page.")]
        WebPageSource = 4,

        [Display(Name = "Current URL Address", Description = "Gets the current URL address of the browser.")]
        CurrentUrlAddress = 5
    }
}