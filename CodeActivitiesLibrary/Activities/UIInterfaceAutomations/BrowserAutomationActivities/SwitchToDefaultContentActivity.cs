using CodeActivitiesLibrary.Extensions;
using OpenQA.Selenium;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Switch To Default Content")]
    [Description("Switches the Selenium WebDriver context back to the main document or top window (exiting all frames/iframe contexts).")]
    public class SwitchToDefaultContentActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Browser Instance")]
        [Description("The active IWebDriver instance representing the browser.")]
        public InArgument<IWebDriver> WebBrowserInstance { get; set; }

        [DisplayName("Switched")]
        [Description("Indicates whether the switch to the iframe was successful (true) or failed (false).")]
        public OutArgument<bool> Switched { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var driver = WebBrowserInstance.Get(context);
                if (driver == null)
                {
                    StatusMessage.Set(context,"Browser instance is null.");
                    Switched.Set(context, false);
                    IsSuccess.Set(context, false);
                    return;
                }

                driver.SwitchTo().DefaultContent();
                StatusMessage.Set(context, "Successfully switched to default content.");
                Switched.Set(context, true);
                IsSuccess.Set(context, true);
              
            }
            catch (Exception ex)
            {
                Switched.Set(context, false);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to switch to default content{ ex.Message}");
            }
        }
    }
}