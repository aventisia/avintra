using CodeActivitiesLibrary.Extensions;
using OpenQA.Selenium;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Close Web Browser Tab")]
    [Description(
        "Closes web browser tabs based on various conditions (current, by title/URL, all except main, timeout-based).")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/BrowserAutomation.svg")]
    public class CloseWebBrowserTabActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Web Browser Instance")]
        [Description("The WebDriver instance containing browser session.")]
        public InArgument<IWebDriver> WebBrowserInstance { get; set; }


        [DisplayName("Close Mode")]
        [Description("Specifies how to close the tab(s): Current, By Title/URL, All Except Main, or After Timeout.")]
        [DefaultValue(CloseModeEnum.Current)]
        public InArgument<CloseModeEnum> CloseMode { get; set; }


        [DisplayName("Match Type")]
        [Description("Select whether to match by URL or Title when using 'ByTitleOrUrl' mode.")]
        [RenderIfCondition(nameof(CloseMode), CloseModeEnum.ByTitleOrUrl)]
        public InArgument<string> MatchType { get; set; }


        [DisplayName("Match Criteria")]
        [Description("Enter the URL or Title to match when using 'ByTitleOrUrl' mode.")]
        [RenderIfCondition(nameof(CloseMode), CloseModeEnum.ByTitleOrUrl)]
        public InArgument<string> MatchCriteria { get; set; }


        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds before closing the tab automatically.")]
        [DefaultValue(60)]
        [RenderIfCondition(nameof(CloseMode), CloseModeEnum.AfterTimeout)]
        public InArgument<int> TimeoutSeconds { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var driver = WebBrowserInstance.Get(context);
                var closeMode = CloseMode.Get(context);
                var matchType = MatchType.Get(context);
                var matchCriteria = MatchCriteria.Get(context);
                var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));

                if (driver == null)
                    throw new ArgumentException("Web browser instance cannot be null.");

                switch (closeMode)
                {
                    case CloseModeEnum.Current:
                        if (driver.WindowHandles.Count <= 1)
                        {
                            driver.Close();
                            status = "Closed single tab.";
                        }
                        else
                        {
                            throw new InvalidOperationException(
                                "More than one tab is open. Use 'All Except Main' to avoid losing context.");
                        }

                        break;

                    case CloseModeEnum.ByTitleOrUrl:
                        var foundAndClosed = false;
                        var handles = new List<string>(driver.WindowHandles);

                        foreach (var handle in handles)
                        {
                            driver.SwitchTo().Window(handle);
                            string matchValue;
                            switch (matchType.ToLower())
                            {
                                case "url":
                                    matchValue = driver.Url;
                                    break;
                                case "title":
                                    matchValue = driver.Title;
                                    break;
                                default:
                                    throw new ArgumentException("Invalid match type.");
                            }

                            if (!matchValue.Contains(matchCriteria)) continue;
                            driver.Close();
                            foundAndClosed = true;
                            status = $"Closed tab with '{matchType}': '{matchCriteria}'.";
                        }

                        if (!foundAndClosed)
                            status = $"No tab matched '{matchType}: {matchCriteria}' to close.";
                        break;

                    case CloseModeEnum.AllExceptMain:
                        if (driver.WindowHandles.Count < 2)
                        {
                            status = "Only one tab is open — nothing to close.";
                            break;
                        }

                        var mainHandle = driver.CurrentWindowHandle;
                        var allHandles = new List<string>(driver.WindowHandles);

                        foreach (var handle in allHandles.Where(handle => handle != mainHandle))
                        {
                            driver.SwitchTo().Window(handle);
                            driver.Close();
                        }

                        driver.SwitchTo().Window(mainHandle);
                        status = "Successfully closed all extra tabs.";
                        break;

                    case CloseModeEnum.AfterTimeout:
                        var sw = new System.Diagnostics.Stopwatch();
                        sw.Start();

                        while (sw.Elapsed < timeout)
                            // Wait until condition is met
                            Thread.Sleep(500);

                        driver.Close();
                        status = "Tab closed due to timeout.";
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(closeMode));
                }
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error closing tab(s): {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }

    public enum CloseModeEnum
    {
        [Display(Name = "Current", Description = "Closes the currently active tab.")]
        Current,

        [Display(Name = "By Title or URL",
            Description = "Closes tab(s) whose title or URL contains the specified text.")]
        ByTitleOrUrl,

        [Display(Name = "All Except Main", Description = "Closes all tabs except the main one.")]
        AllExceptMain,

        [Display(Name = "After Timeout", Description = "Closes the tab after a certain period.")]
        AfterTimeout
    }
}