using CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities.Helpers;
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
using System.Net.Sockets;
using System.Net;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Launch Browser")]
    [Description("Launches a web browser instance of Microsoft Edge or Google Chrome.")]
    [ActivityMetaData(nodeImg: "/assets/BrowserAutomation.svg")]
    public sealed class LaunchBrowserActivity : BaseCodeActivity
    {
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

        [DisplayName("Web Browser")]
        [Description("Returns the Web browser instance.")]
        public OutArgument<IWebDriver> WebBrowserInstance { get; set; }

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

                        // Kill all msedge processes before launching a new one.
                        // Note: Just like chrome Edge does not allow to connect to existing remote debugging session.
                        // We'll have to kill all existing Edge processes to ensure a clean start every time we execute launch Browser node.
                        BrowserAutomationHelper.CloseEdgeWindowsGracefully();
                        System.Threading.Thread.Sleep(2000); // Wait for 2 seconds to ensure all Edge processes are closed
                        KillProcesses("msedge"); // This will close any edge processes those were still left after trying to close gracefully.

                        // Auto resolve the Edge web driver verison if required
                        new DriverManager().SetUpDriver(new EdgeConfig());

                        // Set the user data directory for Edge
                        var edgeUserDataDir = Path.Combine(appDataFolder, "Microsoft", "Edge", "User Data");

                        // Configure and launch Edge driver
                        var edgeService = EdgeDriverService.CreateDefaultService();
                        edgeService.HideCommandPromptWindow = true;
                        var edgeOptions = new EdgeOptions();
                        edgeOptions.AddArgument($"--user-data-dir={edgeUserDataDir}");
                        edgeOptions.AddArgument("--profile-directory=Default");
                        if (browsingMode == BrowsingModeEnum.Private) edgeOptions.AddArgument("--inprivate");
                        webDriver = new EdgeDriver(edgeService, edgeOptions);
                        break;
                    case BrowserTypeEnum.GoogleChrome:
                        // Kill all chromedriver processes before launching a new one
                        KillProcesses("chromedriver");

                        // Auto resolve the Chrome web driver verison if required
                        new DriverManager().SetUpDriver(new ChromeConfig());

                        // Set the user data directory for chrome
                        var chromeUserDataDir = Path.Combine(appDataFolder, "Google", "Chrome", "User Data");

                        // Get port of chrome session with remote debugging enabled
                        var chromePort = GetPortOfRunningChromiumWithRemoteDebugging(processName, chromeUserDataDir);

                        // If no remote debugging port is found, start a new Chrome session
                        if (chromePort == null)
                        {
                            // Get a random available port for remote debugging
                            chromePort = GetAvailablePort().ToString();

                            // Set default arguments for Chrome
                            string arguments = $"--remote-debugging-port={chromePort} --user-data-dir=\"{chromeUserDataDir}\" --profile-directory=Default {launchUrl}";

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
                        chromeOptions.DebuggerAddress = $"localhost:{chromePort}";
                        webDriver = new ChromeDriver(chromeService, chromeOptions);
                        break;
                    default:
                        statusMessage = $"Unsupported browser type: {browserType}";
                        break;
                }

                // Switch to the best available content tab before navigation.
                SelectBestWindow(webDriver, launchUrl);

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

        public static int GetAvailablePort()
        {
            var listener = new TcpListener(IPAddress.Loopback, 0);
            listener.Start();
            int port = ((IPEndPoint)listener.LocalEndpoint).Port;
            listener.Stop();
            return port;
        }

        private static bool IsTargetLaunchUrl(string launchUrl)
        {
            if (string.IsNullOrWhiteSpace(launchUrl))
                return false;

            if (!Uri.TryCreate(launchUrl, UriKind.Absolute, out Uri uri))
                return false;

            return uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps;
        }

        private static void SelectBestWindow(IWebDriver webDriver, string launchUrl)
        {
            if (webDriver == null || webDriver.WindowHandles.Count == 0)
                return;

            var windowHandles = webDriver.WindowHandles;
            var selectedWindowHandle = windowHandles[0];
            var fallbackContentWindowHandle = (string)null;
            var hasTargetLaunchUrl = IsTargetLaunchUrl(launchUrl);

            for (int i = 0; i < windowHandles.Count; i++)
            {
                var handle = windowHandles[i];

                try
                {
                    webDriver.SwitchTo().Window(handle);
                    var currentUrl = webDriver.Url;

                    if (hasTargetLaunchUrl && currentUrl.StartsWith(launchUrl, StringComparison.OrdinalIgnoreCase))
                    {
                        selectedWindowHandle = handle;
                        break;
                    }

                    if (!IsChromiumInternalUrl(currentUrl) && fallbackContentWindowHandle == null)
                    {
                        fallbackContentWindowHandle = handle;
                    }
                }
                catch
                {
                    // Ignore stale/unavailable handles and continue evaluating others.
                }
            }

            if (fallbackContentWindowHandle != null)
            {
                selectedWindowHandle = fallbackContentWindowHandle;
            }

            webDriver.SwitchTo().Window(selectedWindowHandle);
        }

        private static bool IsChromiumInternalUrl(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return true;

            return url.StartsWith("chrome://", StringComparison.OrdinalIgnoreCase)
                || url.StartsWith("edge://", StringComparison.OrdinalIgnoreCase)
                || url.StartsWith("devtools://", StringComparison.OrdinalIgnoreCase)
                || url.StartsWith("chrome-extension://", StringComparison.OrdinalIgnoreCase)
                || url.StartsWith("about:", StringComparison.OrdinalIgnoreCase)
                || url.StartsWith("data:", StringComparison.OrdinalIgnoreCase);
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

        private static string GetPortOfRunningChromiumWithRemoteDebugging(string processName, string userDataDir)
        {
            try
            {
                var mngmtClass = new ManagementClass("Win32_Process");
                foreach (ManagementObject obj in mngmtClass.GetInstances())
                {
                    var nameObj = obj["Name"];
                    var cmdLineObj = obj["CommandLine"];
                    if (nameObj != null && nameObj.ToString().Equals(processName, StringComparison.OrdinalIgnoreCase)
                        && cmdLineObj != null && cmdLineObj.ToString().Contains(userDataDir))
                    {
                        var cmdLine = cmdLineObj.ToString();
                        var match = System.Text.RegularExpressions.Regex.Match(cmdLine, @"--remote-debugging-port=(\d+)");
                        if (match.Success)
                            return match.Groups[1].Value;
                    }
                }
                return null;
            }
            catch
            {
                return null;
            }
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
    }
}