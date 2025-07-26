using CodeActivitiesLibrary.Extensions;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Edge;
using OpenQA.Selenium.Firefox;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.IO;
using System.Linq;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Launch Browser")]
    [Description("Launches a web browser instance (Edge, Chrome, Firefox) with optional window state.")]
    public sealed class LaunchBrowserActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Browser Type")]
        [Description("Specifies which browser to launch (Microsoft Edge, Google Chrome, Mozilla Firefox).")]
        [DefaultValue(BrowserTypeEnum.MicrosoftEdge)]
        public InArgument<BrowserTypeEnum> BrowserType { get; set; }


        [DisplayName("Launch with Url")]
        [Description(
            "If true, launches the browser with a specific URL.")]
        public InArgument<bool> LaunchWithUrl { get; set; }


        [DisplayName("Launch Url")]
        [Description("The URL to launch if Launch with Url is true.")]
        [RenderIfCondition(nameof(LaunchWithUrl), true)]
        public InArgument<string> LaunchUrl { get; set; }

        [DisplayName("Browsing Mode")]
        [Description("Specifies whether to open in normal or private mode.")]
        [DefaultValue(BrowsingModeEnum.Normal)]
        public InArgument<BrowsingModeEnum> BrowsingMode { get; set; }

        [DisplayName("Store Data")]
        [Description(
            "If true, stores browser data (e.g., user profiles) in a specified path. If false, uses default browser settings. this usefull when launching multiple instances of the same browser.")]
        public InArgument<bool> StoreData { get; set; } = true;

        [DisplayName("User Data Storage Path")]
        [Description("Optional path to store browser data (e.g., user profiles). If not provided, a default under %APPDATA%\\RPAProfileData\\[BrowserType] will be used.")]
        [RenderIfCondition(nameof(StoreData), true)]
        public InArgument<string> UserDataStoragePath { get; set; }

        [DisplayName("Custom Browser Name")]
        [Description("Name of the custom browser (required if 'Browser Type' is 'Custom').")]
        [RenderIfCondition(nameof(BrowserType), BrowserTypeEnum.Custom)]
        public InArgument<string> CustomBrowserName { get; set; }


        [DisplayName("Browser Executable Path")]
        [Description(
            "Path to the  browser executable (for Custom type).")]
        [RenderIfCondition(nameof(BrowserType), BrowserTypeEnum.Custom)]
        public InArgument<string> BrowserExecutablePath { get; set; }

        [DisplayName("Driver Executable Path")]
        [Description(
            "Path to driver executable (for Custom type).")]
        [RenderIfCondition(nameof(BrowserType), BrowserTypeEnum.Custom)]
        public InArgument<string> DriverExecutablePath { get; set; }

        [DisplayName("Window State")]
        [Description("Specifies the initial browser window state.")]
        [DefaultValue(WindowStateEnum.Maximized)]
        public InArgument<WindowStateEnum> WindowState { get; set; }

        [DisplayName("Kill Existing Browser Instances")]
        [Description("Enable or disable killing existing Selenium RPA-launched browsers before starting a new one.")]
        [DefaultValue(BrowserKillModeEnum.Enabled)]
        public InArgument<BrowserKillModeEnum> KillExistingBrowserInstancesMode { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("Web Browser")]
        [Description("Returns the WebDriver object for further automation steps.")]
        public OutArgument<IWebDriver> WebBrowser { get; set; }

        // ----------------------
        // Execution Logic
        // ---------------------- 

        protected override void Execute(CodeActivityContext context)
        {
            var browserType = BrowserType.Get(context);
            var killMode = KillExistingBrowserInstancesMode.Get(context);

            if (killMode == BrowserKillModeEnum.Enabled)
            {
                KillExistingBrowserInstances(browserType);
            }

            IWebDriver driver = null;

            try
            {
                var browsingMode = BrowsingMode.Get(context);
                var windowState = WindowState.Get(context);
                var customBrowserName = CustomBrowserName.Get(context);
                var browserExePath = BrowserExecutablePath.Get(context);
                var driverExePath = DriverExecutablePath.Get(context);
                var launchWithUrl = LaunchWithUrl.Get(context);
                var launchUrl = LaunchUrl.Get(context);

                string userDataDir = null;
                var storeData = StoreData.Get(context);

                if (storeData)
                {
                    userDataDir = UserDataStoragePath.Get(context);

                    if (string.IsNullOrWhiteSpace(userDataDir))
                    {
                        var localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);

                        // Use traditional switch-case for compatibility with C# 7.3
                        switch (browserType)
                        {
                            case BrowserTypeEnum.MicrosoftEdge:
                                userDataDir = Path.Combine(localAppData, "RPAProfileData", "EdgeProfile");
                                break;

                            case BrowserTypeEnum.GoogleChrome:
                                userDataDir = Path.Combine(localAppData, "Chrome", "ChromeProfile");
                                break;

                            default:
                                userDataDir = Path.Combine(localAppData, "RPAProfileData", browserType.ToString());
                                break;
                        }
                    }

                    // Create directory if it doesn't exist
                    Directory.CreateDirectory(userDataDir);
                }



                switch (browserType)
                {
                    case BrowserTypeEnum.MicrosoftEdge:
                        driver = OpenMicrosoftEdgeBrowser(browsingMode, launchWithUrl, launchUrl, storeData, userDataDir);
                        break;
                    case BrowserTypeEnum.GoogleChrome:
                        driver = OpenChromeBrowser(browsingMode, launchWithUrl, launchUrl, storeData, userDataDir);
                        break;
                    case BrowserTypeEnum.MozillaFirefox:
                        driver = OpenFireFox(browsingMode, launchWithUrl, launchUrl, storeData, userDataDir);
                        break;
                    case BrowserTypeEnum.Custom:
                        driver = OpenCustomBrowser(customBrowserName, browserExePath, driverExePath, browsingMode,
                            launchWithUrl, launchUrl, storeData);
                        break;
                    default:
                        throw new ArgumentOutOfRangeException(nameof(browserType));
                }

                switch (windowState)
                {
                    case WindowStateEnum.Maximized:
                        driver.Manage().Window.Maximize();
                        break;
                    case WindowStateEnum.Minimized:
                        driver.Manage().Window.Minimize();
                        break;
                    case WindowStateEnum.Normal:
                        break;
                    default:
                        throw new ArgumentOutOfRangeException(nameof(windowState));
                }

                WebBrowser.Set(context, driver);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully launched {browserType}.");
            }
            catch (Exception ex)
            {
                driver?.Quit();
                driver = null;
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error launching browser: {ex.Message}");
            }
        }

        private static void KillExistingBrowserInstances(BrowserTypeEnum browserType)
        {
            // Get list of running processes
            var processes = Process.GetProcesses();

            foreach (var process in processes)
            {
                try
                {
                    // Match based on browser type and command-line args
                    bool isAutomationProcess = false;

                    switch (browserType)
                    {
                        case BrowserTypeEnum.GoogleChrome:
                            if (process.ProcessName.ToLower().Contains("chrome"))
                            {
                                string cmdLine = GetCommandLine(process);
                                isAutomationProcess = cmdLine.Contains("test-type") || cmdLine.Contains("webdriver") ||
                                                      cmdLine.Contains("remote-debugging-port");
                            }
                            break;

                        case BrowserTypeEnum.MicrosoftEdge:
                            if (process.ProcessName.ToLower().Contains("edge"))
                            {
                                string cmdLine = GetCommandLine(process);
                                isAutomationProcess = cmdLine.Contains("webdriver") || cmdLine.Contains("remote-debugging-port");
                            }
                            break;

                        case BrowserTypeEnum.MozillaFirefox:
                            if (process.ProcessName.ToLower().Contains("firefox"))
                            {
                                string cmdLine = GetCommandLine(process);
                                isAutomationProcess = cmdLine.Contains("-marionette");
                            }
                            break;
                    }

                    if (isAutomationProcess)
                    {
                        Console.WriteLine($"Killing automation browser instance: {process.ProcessName} (PID: {process.Id})");
                        process.Kill();
                        process.WaitForExit();
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error while checking or killing process: {ex.Message}");
                }
            }
        }

        // Helper to get command line args of a process
        private static string GetCommandLine(Process process)
        {
            try
            {
                using (var searcher = new System.Management.ManagementObjectSearcher(
                           $"SELECT CommandLine FROM Win32_Process WHERE ProcessId = {process.Id}"))
                {
                    var obj = searcher.Get()?.Cast<System.Management.ManagementObject>().FirstOrDefault();
                    return obj?["CommandLine"]?.ToString() ?? "";
                }
            }
            catch
            {
                return "";
            }
        }

        private static IWebDriver OpenMicrosoftEdgeBrowser(BrowsingModeEnum browsingMode, bool launchWithUrl,
            string launchUrl, bool storeData, string userDataDir)
        {
            var options = new EdgeOptions();
            if (browsingMode == BrowsingModeEnum.Private) options.AddArgument("--inprivate");

            if (storeData && !string.IsNullOrEmpty(userDataDir))
            {
                Directory.CreateDirectory(userDataDir);
                options.AddArgument($"--user-data-dir={userDataDir}");
            }

            var service = EdgeDriverService.CreateDefaultService();
            service.HideCommandPromptWindow = true;
            var driver = new EdgeDriver(service, options);
            if (launchWithUrl && !string.IsNullOrWhiteSpace(launchUrl))
                driver.Navigate().GoToUrl(launchUrl);
            return driver;
        }

        private static IWebDriver OpenChromeBrowser(BrowsingModeEnum browsingMode, bool launchWithUrl,
            string launchUrl, bool storeData, string userDataDir)
        {
            var options = new ChromeOptions();
            if (browsingMode == BrowsingModeEnum.Private) options.AddArgument("--incognito");

            if (storeData && !string.IsNullOrEmpty(userDataDir))
            {
                Directory.CreateDirectory(userDataDir);
                options.AddArgument($"--user-data-dir={userDataDir}");
            }

            var service = ChromeDriverService.CreateDefaultService();
            service.HideCommandPromptWindow = true;
            var driver = new ChromeDriver(service, options);
            if (launchWithUrl && !string.IsNullOrWhiteSpace(launchUrl))
                driver.Navigate().GoToUrl(launchUrl);
            return driver;
        }

        private static IWebDriver OpenFireFox(BrowsingModeEnum browsingMode, bool launchWithUrl,
            string launchUrl, bool storeData, string userDataDir)
        {
            var options = new FirefoxOptions();
            if (browsingMode == BrowsingModeEnum.Private)
                options.SetPreference("browser.privatebrowsing.autostart", true);

            if (storeData && !string.IsNullOrEmpty(userDataDir))
            {
                Directory.CreateDirectory(userDataDir);
                options.Profile = new FirefoxProfile(userDataDir);
            }

            var service = FirefoxDriverService.CreateDefaultService();
            service.HideCommandPromptWindow = true;
            var driver = new FirefoxDriver(service, options);
            if (launchWithUrl && !string.IsNullOrWhiteSpace(launchUrl))
                driver.Navigate().GoToUrl(launchUrl);
            return driver;
        }

        private static IWebDriver OpenCustomBrowser(
            string customBrowserName, string browserExePath, string driverExePath, BrowsingModeEnum browsingMode,
            bool launchWithUrl, string launchUrl, bool storeData)
        {
            throw new NotImplementedException("Custom browser handling is not yet implemented.");
        }
    }
    public enum BrowserKillModeEnum
    {
        [Display(Name = "Enabled",
            Description = "Kill existing Selenium RPA browser instances before launching a new one.")]
        Enabled,

        [Display(Name = "Disabled",
            Description = "Do not kill existing Selenium RPA browser instances before launching a new one.")]
        Disabled
    }
    public enum BrowserTypeEnum
    {
        [Display(Name = "Microsoft Edge", Description = "Launches Microsoft Edge browser.")]
        MicrosoftEdge,

        [Display(Name = "Google Chrome", Description = "Launches Google Chrome browser.")]
        GoogleChrome,

        [Display(Name = "Mozilla Firefox", Description = "Launches Mozilla Firefox browser.")]
        MozillaFirefox,

        [Display(Name = "Custom",
            Description = "Launches a custom browser by specifying its executable and driver paths.")]
        Custom
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