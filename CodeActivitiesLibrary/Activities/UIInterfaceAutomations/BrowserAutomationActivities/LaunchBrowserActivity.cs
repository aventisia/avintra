using CodeActivitiesLibrary.Extensions;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Edge;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.IO;
using System.Management;
using WebDriverManager.DriverConfigs.Impl;
using WebDriverManager;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Launch Browser")]
    [Description("Launches a web browser instance of Microsoft Edge or Google Chrome.")]
    public sealed class LaunchBrowserActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Browser Type")]
        [Description("Specifies which browser to launch (Microsoft Edge, Google Chrome).")]
        [DefaultValue(BrowserTypeEnum.MicrosoftEdge)]
        public InArgument<BrowserTypeEnum> BrowserType { get; set; }

        [DisplayName("Launch Url")]
        [Description("The URL to launch the browser with. If empty, the browser will launch without navigating to a specific page.")]
        [DefaultValue("")]
        public InArgument<string> LaunchUrl { get; set; }

        [DisplayName("Browsing Mode")]
        [Description("Specifies whether to open in normal or private mode.")]
        [DefaultValue(BrowsingModeEnum.Normal)]
        public InArgument<BrowsingModeEnum> BrowsingMode { get; set; }

        [DisplayName("Window State")]
        [Description("Specifies the initial browser window state.")]
        [DefaultValue(WindowStateEnum.Maximized)]
        public InArgument<WindowStateEnum> WindowState { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("Web Browser")]
        [Description("Returns the Web browser instance.")]
        public OutArgument<IWebDriver> WebBrowserInstance { get; set; }

        // ----------------------
        // Execution Logic
        // ---------------------- 

        protected override void Execute(CodeActivityContext context)
        {
            // Get input arguments
            var browserType = BrowserType.Get(context);
            var processName = GetBrowserProcessName(browserType);
            var launchUrl = LaunchUrl.Get(context);
            var browsingMode = BrowsingMode.Get(context);
            var windowState = WindowState.Get(context);

            // Initialize variables
            var statusMessage = string.Empty;
            IWebDriver webDriver = null;
            var appDataFolder = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            launchUrl = string.IsNullOrWhiteSpace(launchUrl) ? "data:" : launchUrl;

            try
            {
                switch (browserType)
                {
                    case BrowserTypeEnum.MicrosoftEdge:
                        // Kill all msedgedriver processes before launching a new one
                        KillProcesses("msedgedriver");

                        // Auto resolve the Edge web driver verison if required
                        new DriverManager().SetUpDriver(new EdgeConfig());

                        // Start a reusable edge session with remote debugging enabled
                        var edgePort = "37196"; // Default port for edge remote debugging
                        if (!IsChromiumWithRemoteDebuggingRunning(processName, edgePort))
                        {
                            // Set the user data directory for Edge
                            var edgeUserDataDir = Path.Combine(appDataFolder, "Microsoft", "Edge", "User Data");

                            // Set default arguments for Edge
                            string arguments = $"--remote-debugging-port={edgePort} --user-data-dir=\"{edgeUserDataDir}\" --profile-directory=Default {launchUrl}";

                            // If browsing mode is private, add the inprivate argument
                            if (browsingMode == BrowsingModeEnum.Private)
                                arguments += " --inprivate";

                            // Start the Edge process with the specified arguments
                            var process = new Process();
                            process.StartInfo.FileName = "msedge.exe";
                            process.StartInfo.Arguments = arguments;
                            process.Start();
                        }

                        // Base configuration for Edge
                        var edgeService = EdgeDriverService.CreateDefaultService();
                        edgeService.HideCommandPromptWindow = true;
                        var edgeOptions = new EdgeOptions();
                        edgeOptions.DebuggerAddress = $"localhost:{edgePort}";
                        webDriver = new EdgeDriver(edgeService, edgeOptions);
                        break;
                    case BrowserTypeEnum.GoogleChrome:
                        // Kill all chromedriver processes before launching a new one
                        KillProcesses("chromedriver");

                        // Auto resolve the Chrome web driver verison if required
                        new DriverManager().SetUpDriver(new ChromeConfig());

                        // Start a reusable chrome session with remote debugging enabled
                        var chromPort = "73562"; // Default port for chrome remote debugging
                        if (!IsChromiumWithRemoteDebuggingRunning(processName, chromPort))
                        {
                            // Set the user data directory for chrome
                            var chromeUserDataDir = Path.Combine(appDataFolder, "Google", "Chrome", "User Data");

                            // Set default arguments for Chrome
                            string arguments = $"--remote-debugging-port={chromPort} --user-data-dir=\"{chromeUserDataDir}\" --profile-directory=Default {launchUrl}";

                            // If browsing mode is private, add the incognito argument
                            if (browsingMode == BrowsingModeEnum.Private)
                                arguments += " --incognito";

                            // Start the Chrome process with the specified arguments
                            var process = new Process();
                            process.StartInfo.FileName = "chrome.exe";
                            process.StartInfo.Arguments = arguments;
                            process.Start();
                        }

                        // Base configuration for Chrome
                        var chromeService = ChromeDriverService.CreateDefaultService();
                        chromeService.HideCommandPromptWindow = true;
                        var chromeOptions = new ChromeOptions();
                        chromeOptions.DebuggerAddress = $"localhost:{chromPort}";
                        webDriver = new ChromeDriver(chromeService, chromeOptions);
                        break;
                    default:
                        statusMessage = $"Unsupported browser type: {browserType}";
                        break;
                }

                // Grab the first available window handle
                if (webDriver != null && webDriver.WindowHandles.Count > 0)
                {
                    webDriver.SwitchTo().Window(webDriver.WindowHandles[0]);
                }

                // Go to the specified URL if provided
                if (webDriver != null && !string.IsNullOrWhiteSpace(launchUrl))
                    webDriver.Navigate().GoToUrl(launchUrl);

                // Set the window state
                switch (windowState)
                {
                    case WindowStateEnum.Maximized:
                        webDriver.Manage().Window.Maximize();
                        break;
                    case WindowStateEnum.Minimized:
                        webDriver.Manage().Window.Minimize();
                        break;
                }

                // Set output arguments with success
                WebBrowserInstance.Set(context, webDriver);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully launched {browserType}.");
            }
            catch (Exception ex)
            {
                WebBrowserInstance.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error launching browser: {ex.Message}");
            }
        }

        private void KillProcesses(string processName)
        {
            try
            {
                foreach (var process in Process.GetProcessesByName(processName))
                {
                    process.Kill();
                }
            }
            catch (Exception ex)
            {
                // Log or handle the exception as needed
                Console.WriteLine($"Error killing browser processes: {ex.Message}");
            }
        }

        private static string GetBrowserProcessName(BrowserTypeEnum browserType)
        {
            switch (browserType)
            {
                case BrowserTypeEnum.MicrosoftEdge:
                    return "msedge.exe";
                case BrowserTypeEnum.GoogleChrome:
                    return "chrome.exe";
                default:
                    return "Not Supported";
            }
        }

        private static bool IsChromiumWithRemoteDebuggingRunning(string processName, string port)
        {
            try
            {
                ManagementClass mngmtClass = new ManagementClass("Win32_Process");
                foreach (ManagementObject obj in mngmtClass.GetInstances())
                {
                    var nameObj = obj["Name"];
                    if (nameObj != null && nameObj.ToString().Equals(processName, StringComparison.OrdinalIgnoreCase))
                    {
                        var cmdLineObj = obj["CommandLine"];
                        if (cmdLineObj != null && cmdLineObj.ToString().Contains($"--remote-debugging-port={port}"))
                            return true;
                    }
                }
            }
            catch { }

            return false;
        }
    }

    public enum BrowserTypeEnum
    {
        [Display(Name = "Microsoft Edge", Description = "Launches Microsoft Edge browser.")]
        MicrosoftEdge,

        [Display(Name = "Google Chrome", Description = "Launches Google Chrome browser.")]
        GoogleChrome
    }

    public enum BrowsingModeEnum
    {
        [Display(Name = "Normal", Description = "Opens browser in normal mode.")]
        Normal,

        [Display(Name = "Private", Description = "Opens browser in private/incognito mode.")]
        Private
    }

    public enum WindowStateEnum
    {
        [Display(Name = "Maximized", Description = "Launches browser in maximized window state.")]
        Maximized,

        [Display(Name = "Minimized", Description = "Launches browser in minimized window state.")]
        Minimized,

        [Display(Name = "Normal", Description = "Launches browser in normal window state.")]
        Normal
    }
}