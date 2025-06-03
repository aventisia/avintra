using CodeActivitiesLibrary.Extensions;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Enumerable = System.Linq.Enumerable;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Switch To Tab")]
    [Description("Switches control to a browser tab using index, title, or partial URL.")]
    public class SwitchToTabActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<IWebDriver> WebBrowserInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Switch Mode")]
        [Description("Specifies how to locate the tab: by index, title, or URL fragment.")]
        [DefaultValue(SwitchModeEnum.ByIndex)]
        public InArgument<SwitchModeEnum> SwitchMode { get; set; }


        [DisplayName("Tab Index")]
        [Description("The index (1-based) of the tab to switch to.")]
        [RenderIfCondition(nameof(SwitchMode), "ByIndex")]
        public InArgument<int> TabIndex { get; set; }


        [DisplayName("Tab Title")]
        [Description("The title of the tab to switch to.")]
        [RenderIfCondition(nameof(SwitchMode), "ByTitle")]
        public InArgument<string> TabTitle { get; set; }


        [DisplayName("URL Fragment")]
        [Description("A partial URL (e.g., 'example.com') to match the tab.")]
        [RenderIfCondition(nameof(SwitchMode), "ByUrlFragment")]
        public InArgument<string> UrlFragment { get; set; }

        [Category("Advanced")]
        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds to wait for the tab to become available.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutSeconds { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------




        [DisplayName("Current Tab Title")]
        [Description("Returns the title of the tab after switching.")]
        public OutArgument<string> CurrentTabTitle { get; set; }


        [DisplayName("Current Tab URL")]
        [Description("Returns the current URL after switching tabs.")]
        public OutArgument<string> CurrentTabUrl { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            var currentUrl = "";
            var currentTitle = "";

            try
            {
                var driver = WebBrowserInstance.Get(context);
                var switchMode = SwitchMode.Get(context);
                var tabIndex = TabIndex.Get(context);
                var tabTitle = TabTitle.Get(context);
                var urlFragment = UrlFragment.Get(context);
                var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));

                if (driver == null)
                    throw new ArgumentException("Web browser instance cannot be null.");

                var windowHandles = new List<string>(driver.WindowHandles);

                if (windowHandles.Count == 0)
                    throw new InvalidOperationException("No open tabs found.");

                var success = false;
                string targetHandle = null;

                switch (switchMode)
                {
                    case SwitchModeEnum.ByIndex:
                        if (tabIndex < 1 || tabIndex > windowHandles.Count)
                            throw new ArgumentOutOfRangeException(nameof(tabIndex),
                                $"Invalid tab index. Must be between 1 and {windowHandles.Count}.");
                        targetHandle = windowHandles[tabIndex - 1];
                        break;

                    case SwitchModeEnum.ByTitle:
                        targetHandle = windowHandles.FirstOrDefault(handle =>
                        {
                            driver.SwitchTo().Window(handle);
                            return driver.Title.ToLower().Contains(tabTitle.ToLower());
                        });
                        break;

                    case SwitchModeEnum.ByUrlFragment:
                        targetHandle = Enumerable.FirstOrDefault(windowHandles);
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(switchMode));
                }

                if (targetHandle == null)
                    throw new InvalidOperationException($"No tab found matching '{switchMode}' criteria.");

                // Switch to the target handle
                driver.SwitchTo().Window(targetHandle);

                // Optional: Wait until the page is ready
                var wait = new WebDriverWait(driver, timeout);
                wait.Until(d => d.Title != null && d.Title.Length > 0);
                wait.Until(d => d.Url != null && d.Url.Length > 0);

                currentUrl = driver.Url;
                currentTitle = driver.Title;
                status = $"Switched to tab '{currentTitle}' ({currentUrl})";
                success = true;
            }
            catch (Exception ex)
            {
                status = $"Error switching tab: {ex.Message}";
            }

            StatusMessage.Set(context, status);
            CurrentTabUrl.Set(context, currentUrl);
            CurrentTabTitle.Set(context, currentTitle);
        }
    }

    public enum SwitchModeEnum
    {
        [Display(Name = "By Index", Description = "Switch to tab by its position (1-based).")]
        ByIndex,

        [Display(Name = "By Title", Description = "Switch to tab by its full or partial title.")]
        ByTitle,

        [Display(Name = "By URL Fragment", Description = "Switch to tab whose URL contains the specified text.")]
        ByUrlFragment
    }
}