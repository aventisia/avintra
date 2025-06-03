using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Scroll To Element or Position")]
    [Description("Scrolls the browser window to a specified element or coordinates.")]
    public class ScrollToElementOrPositionActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]

        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<IWebDriver> WebBrowserInstance { get; set; }


        [DisplayName("Scroll Mode")]
        [Description("Specifies how to scroll: by element or by coordinates.")]
        [DefaultValue(ScrollModeEnum.ByElement)]
        public InArgument<ScrollModeEnum> ScrollMode { get; set; }


        [DisplayName("Find Type")]
        [Description("Specifies how to find the element to scroll to (e.g., ID, XPath).")]
        [RenderIfCondition(nameof(ScrollMode), "ByElement")]
        public InArgument<string> FindType { get; set; }


        [DisplayName("Search Keywords")]
        [Description("The value used to locate the element to scroll to (e.g., 'username', '//input[@id='email']').")]
        [RenderIfCondition(nameof(ScrollMode), "ByElement")]
        public InArgument<string> SearchKeywords { get; set; }


        [DisplayName("X Coordinate")]
        [Description("Horizontal scroll position. Only used in 'By Coordinates' mode.")]
        [RenderIfCondition(nameof(ScrollMode), "ByCoordinates")]
        public InArgument<int> XCoordinate { get; set; }


        [DisplayName("Y Coordinate")]
        [Description("Vertical scroll position. Only used in 'By Coordinates' mode.")]
        [RenderIfCondition(nameof(ScrollMode), "ByCoordinates")]
        public InArgument<int> YCoordinate { get; set; }

        [Category("Advanced")]
        [DisplayName("Wait For Element")]
        [Description("If true, waits for the element to be present before scrolling.")]
        public InArgument<bool> WaitForElement { get; set; }

        [Category("Advanced")]
        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds to wait for the element before failing.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutSeconds { get; set; }

        [Category("Advanced")]
        [DisplayName("Smooth Scroll")]
        [Description("If true, scrolls smoothly instead of jumping to the target.")]
        public InArgument<bool> SmoothScroll { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------



        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var driver = WebBrowserInstance.Get(context);
                var scrollMode = ScrollMode.Get(context);
                var findType = FindType.Get(context);
                var searchKeywords = SearchKeywords.Get(context);
                var xCoord = XCoordinate.Get(context);
                var yCoord = YCoordinate.Get(context);
                var smoothScroll = SmoothScroll.Get(context);
                var waitForElement = WaitForElement.Get(context);
                var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));

                if (driver == null)
                    throw new ArgumentException("Web browser instance cannot be null.");

                var jsExecutor = (IJavaScriptExecutor)driver;

                switch (scrollMode)
                {
                    case ScrollModeEnum.ByElement:
                        {
                            if (string.IsNullOrWhiteSpace(findType))
                                throw new ArgumentException(
                                    "Find type must be specified when using 'ByElement' scroll mode.");

                            if (string.IsNullOrWhiteSpace(searchKeywords))
                                throw new ArgumentException(
                                    "Search keywords must be specified when using 'ByElement' scroll mode.");

                            // Locate the element
                            var by = BrowserAutomationHelper.GetWebElementLocator(findType, searchKeywords);
                            if (by == null)
                                throw new ArgumentException($"Invalid find type provided: '{findType}'");

                            IWebElement element = null;

                            if (waitForElement && timeout.TotalSeconds > 0)
                            {
                                var wait = new WebDriverWait(driver, timeout);
                                element = wait.Until(drv => drv.FindElement(by));
                            }
                            else
                            {
                                element = driver.FindElement(by);
                            }

                            if (element == null)
                                throw new InvalidOperationException(
                                    $"No element found using '{findType}': '{searchKeywords}'");

                            // Scroll to element
                            var behavior = smoothScroll ? "smooth" : "auto";
                            jsExecutor.ExecuteScript(
                                $"arguments[0].scrollIntoView({{ behavior: '{behavior}', block: 'center' }});",
                                element);

                            status = $"Successfully scrolled to element '{searchKeywords}'.";
                            break;
                        }

                    case ScrollModeEnum.ByCoordinates:
                        {
                            if (xCoord < 0 || yCoord < 0)
                                throw new ArgumentException("Coordinates must be positive numbers.");

                            // Scroll by X,Y
                            jsExecutor.ExecuteScript($"window.scrollTo({xCoord}, {yCoord});");
                            status = $"Scrolled to position ({xCoord}, {yCoord}).";
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(scrollMode), "Unsupported scroll mode.");
                }
            }
            catch (Exception ex)
            {
                status = $"Error during scroll operation: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }

    public enum ScrollModeEnum
    {
        [Display(Name = "By Element", Description = "Scrolls to a specific UI element on the page.")]
        ByElement,

        [Display(Name = "By Coordinates", Description = "Scrolls to a specific (X,Y) position on the page.")]
        ByCoordinates
    }
}