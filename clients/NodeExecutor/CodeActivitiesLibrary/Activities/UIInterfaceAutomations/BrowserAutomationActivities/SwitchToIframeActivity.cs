using CodeActivitiesLibrary.Extensions;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Switch To Iframe")]
    [Description("Switches the browser context to a specified iframe using the provided locator type and value (e.g., ID, Name, XPath, or CSS Selector).")]
    [ActivityMetaData(nodeImg: "/assets/BrowserAutomation.svg")]
    public sealed class SwitchToIframeActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Browser Instance")]
        [Description("The active IWebDriver instance representing the browser.")]
        public InArgument<IWebDriver> WebBrowserInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Iframe Locator Type")]
        [Description("The type of locator used to identify the iframe. Supported values: Id, Name, XPath, Css, or Index.")]
        public InArgument<LocatorTypeEnum> IframeLocatorType { get; set; }

        [RequiredArgument]
        [DisplayName("Iframe Locator Value")]
        [Description("The value corresponding to the locator type (e.g., the iframe's ID, name, XPath expression, CSS selector, or zero-based index).")]
        public InArgument<string> IframeLocatorValue { get; set; }

        [DisplayName("Timeout (Seconds)")]
        [Description("Maximum time (in seconds) to wait for the iframe to become available before timing out.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutSeconds { get; set; }

        [DisplayName("Switched")]
        [Description("Indicates whether the switch to the iframe was successful (true) or failed (false).")]
        public OutArgument<bool> Switched { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var driver = WebBrowserInstance.Get(context);
            var locatorType = IframeLocatorType.Get(context); 
            var locatorValue = IframeLocatorValue.Get(context);
            var timeout = TimeoutSeconds.Get(context);

            if (driver == null || string.IsNullOrEmpty(locatorValue))
            {
                Switched.Set(context, false);
                return;
            }

            try
            {
                var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(timeout));

                switch (locatorType)
                {
                    case LocatorTypeEnum.Id:
                        wait.Until(drv => drv.FindElement(By.Id(locatorValue)));
                        driver.SwitchTo().Frame(locatorValue);
                        break;

                    case LocatorTypeEnum.Name:
                        wait.Until(drv => drv.FindElement(By.Name(locatorValue)));
                        driver.SwitchTo().Frame(locatorValue);
                        break;

                    case LocatorTypeEnum.XPath:
                        var xpathElement = wait.Until(drv => drv.FindElement(By.XPath(locatorValue)));
                        driver.SwitchTo().Frame(xpathElement);
                        break;

                    case LocatorTypeEnum.Css:
                        var cssElement = wait.Until(drv => drv.FindElement(By.CssSelector(locatorValue)));
                        driver.SwitchTo().Frame(cssElement);
                        break;

                    case LocatorTypeEnum.Index:
                        if (int.TryParse(locatorValue, out int index) && index >= 0)
                        {
                            // Wait until enough iframes exist
                            wait.Until(drv => drv.FindElements(By.TagName("iframe")).Count > index);
                            driver.SwitchTo().Frame(index);
                        }
                        else
                        {
                            throw new ArgumentException("Iframe Locator Value must be a valid non-negative integer when Locator Type is 'Index'.");
                        }
                        break;

                    default:
                        throw new NotSupportedException($"Unsupported iframe locator type: {locatorType}.");
                }

                Switched.Set(context, true);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Successfully switched to the i frame browser");
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error switch to iframe browser: {ex.Message}");
                Switched.Set(context, false);
                IsSuccess.Set(context, false);
            }
        }
    }


    // Represents the supported element locator strategies for iframe.
    public enum LocatorTypeEnum
    {
        [Display(Name = "ID", Description = "Locate element by its 'id' attribute.")]
        Id = 0,

        [Display(Name = "Name", Description = "Locate element by its 'name' attribute.")]
        Name = 1,

        [Display(Name = "XPath", Description = "Locate element using XPath expression.")]
        XPath = 2,

        [Display(Name = "CSS Selector", Description = "Locate element using CSS selector.")]
        Css = 3,

        [Display(Name = "Index", Description = "Locate element by its zero-based index among matched elements.")]
        Index = 4
    }
}