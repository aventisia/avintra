using System;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities.Helpers
{
    public class BrowserAutomationHelper
    {
        public static IWebElement FindElement(IWebDriver driver, string findType, string searchValue,
            string isDisplayed = "Validate", string isEnabled = "Validate", int waitSeconds = 10)
        {
            try
            {
                var by = GetWebElementLocator(findType, searchValue);
                var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(waitSeconds));
                return wait.Until(drv =>
                {
                    var elem = drv.FindElement(by);

                    switch (isDisplayed)
                    {
                        case "Validate" when isEnabled == "Validate":
                            return elem.Displayed && elem.Enabled ? elem : null;
                        case "Validate":
                            return elem.Displayed ? elem : null;
                    }

                    if (isEnabled == "Validate")
                        return elem.Enabled ? elem : null;

                    return elem;
                });
            }
            catch (Exception)
            {
                return null;
            }
        }

        public static By GetWebElementLocator(string findType, string searchValue)
        {
            switch (findType.ToLower())
            {
                case "id":
                    return By.Id(searchValue);
                case "name":
                    return By.Name(searchValue);
                case "xpath":
                    return By.XPath(searchValue);
                case "cssselector":
                    return By.CssSelector(searchValue);
                case "classname":
                    return By.ClassName(searchValue);
                case "linktext":
                    return By.LinkText(searchValue);
                case "partiallinktext":
                    return By.PartialLinkText(searchValue);
                case "tagname":
                    return By.TagName(searchValue);
                default:
                    throw new ArgumentException($"Unsupported find type: {findType}");
            }
        }
    }
}