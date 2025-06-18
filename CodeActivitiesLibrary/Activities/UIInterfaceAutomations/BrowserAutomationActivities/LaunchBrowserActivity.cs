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
using System.IO;

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
            "If true, launches the browser with a specific url. If false, opens to the default homepage.")]
        public InArgument<bool> LaunchWithUrl { get; set; }


        [DisplayName("Launch Url")]
        [Description(
            "Launches the browser with a specific url. If not specified, the browser will open to its default homepage.")]
        [RenderIfCondition(nameof(LaunchWithUrl), true)]
        public InArgument<string> LaunchUrl { get; set; }


        [DisplayName("Browsing Mode")]
        [Description("Specifies whether to open in normal or private browsing mode.")]
        [DefaultValue(BrowsingModeEnum.Normal)]
        public InArgument<BrowsingModeEnum> BrowsingMode { get; set; }


        [DisplayName("User Data Storage Path")]
        [Description(
            "Path to store browser data (e.g., user profiles). Required if need for store data somewhere else.")]
        public InArgument<string> UserDataStoragePath { get; set; }


        [DisplayName("Custom Browser Name")]
        [Description("Name of the custom browser (required if 'Browser Type' is 'Custom').")]
        [RenderIfCondition(nameof(BrowserType), BrowserTypeEnum.Custom)]
        public InArgument<string> CustomBrowserName { get; set; }


        [DisplayName("Browser Executable Path")]
        [Description(
            "The path to the browser executable (e.g., firefox.exe, chrome.exe). Required if 'Browser Type' is 'Custom'.")]
        [RenderIfCondition(nameof(BrowserType), BrowserTypeEnum.Custom)]
        public InArgument<string> BrowserExecutablePath { get; set; }


        [DisplayName("Driver Executable Path")]
        [Description(
            "The path to the driver executable (e.g., geckodriver.exe for Firefox). Required if 'Browser Type' is 'Custom'.")]
        [RenderIfCondition(nameof(BrowserType), BrowserTypeEnum.Custom)]
        public InArgument<string> DriverExecutablePath { get; set; }


        [DisplayName("Window State")]
        [Description("Specifies the initial browser window state.")]
        [DefaultValue(WindowStateEnum.Maximized)]
        public InArgument<WindowStateEnum> WindowState { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Web Browser")]
        [Description("Returns the WebDriver (WebBrowser) object for further automation steps.")]
        public OutArgument<IWebDriver> WebBrowser { get; set; }


        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";
            IWebDriver driver = null;

            try
            {
                var browserType = BrowserType.Get(context);
                var browsingMode = BrowsingMode.Get(context);
                var windowState = WindowState.Get(context);
                var customBrowserName = CustomBrowserName.Get(context);
                var browserExePath = BrowserExecutablePath.Get(context);
                var driverExePath = DriverExecutablePath.Get(context);
                var userDataDir = UserDataStoragePath.Get(context);
                var launchWithUrl = LaunchWithUrl.Get(context);
                var launchUrl = LaunchUrl.Get(context);

                switch (browserType)
                {
                    case BrowserTypeEnum.MicrosoftEdge:
                        {
                            driver = OpenMicrosoftEdgeBrowser(browsingMode, launchWithUrl, launchUrl, userDataDir);
                            break;
                        }

                    case BrowserTypeEnum.GoogleChrome:
                        {
                            driver = OpenChromeBrowser(browsingMode, launchWithUrl, launchUrl, userDataDir);
                            break;
                        }

                    case BrowserTypeEnum.MozillaFirefox:
                        {
                            driver = OpenFireFox(browsingMode, launchWithUrl, launchUrl, userDataDir);
                            break;
                        }

                    case BrowserTypeEnum.Custom:
                        {
                            driver = OpenCustomBrowser(customBrowserName, browserExePath, driverExePath, browsingMode,
                                launchWithUrl, launchUrl);
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(browserType));
                }

                // Apply window state after launch
                switch (windowState)
                {
                    case WindowStateEnum.Maximized:
                        driver.Manage().Window.Maximize();
                        break;

                    case WindowStateEnum.Minimized:
                        driver.Manage().Window.Minimize();
                        break;

                    case WindowStateEnum.Normal:
                        // No action needed, already launched in normal size
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(windowState));
                }
                WebBrowser.Set(context, driver);
                status = $"Successfully launched {GetBrowserName(browserType)} in {windowState} mode.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);

            }
            catch (Exception ex)
            {
                status = $"Error launching browser: {ex.Message}";
                driver?.Quit(); // Clean up if partially launched
                driver = null;
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }

            // * --no-sandbox: This argument allows you to run browser without sandboxing. Sandboxing
            // is a security feature that prevents malicious code from accessing your system. However,
            // in some cases, you might need to disable it.
            //
            // * --disable-dev-shm-usage: This argument prevents browser from
            // using shared memory for rendering. This can help prevent performance issues.
            IWebDriver OpenMicrosoftEdgeBrowser(BrowsingModeEnum browsingMode, bool launchWithUrl, string launchUrl,
                string userDataDir = null)
            {
                try
                {
                    var edgeOptions = new EdgeOptions();
                    var arguments = new List<string>
                    {
                        "--start-maximized",
                        "--no-sandbox",
                        "--disable-dev-shm-usage"
                    };

                    // Set default Edge user data directory if not specified
                    userDataDir = userDataDir ?? Path.Combine(
                        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                        "Microsoft", "Edge", "AutomationProfile");

                    if (!string.IsNullOrEmpty(userDataDir) && browsingMode != BrowsingModeEnum.Private)
                    {
                        Directory.CreateDirectory(userDataDir); // Ensure directory exists
                        arguments.Add($"--user-data-dir={userDataDir}");
                        Console.WriteLine($"Edge user data: {userDataDir}");
                    }

                    if (browsingMode == BrowsingModeEnum.Private)
                        arguments.Add("--inprivate");


                    edgeOptions.AddArguments(arguments);
                    var edgeService = EdgeDriverService.CreateDefaultService();
                    edgeService.HideCommandPromptWindow = true;

                    var edriver = new EdgeDriver(edgeService, edgeOptions, TimeSpan.FromSeconds(30));
                    if (launchWithUrl && !string.IsNullOrWhiteSpace(launchUrl))
                        edriver.Navigate().GoToUrl(launchUrl);
                    return edriver;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Edge Error: {ex.Message}");
                    throw;
                }
            }

            IWebDriver OpenChromeBrowser(BrowsingModeEnum browsingMode, bool launchWithUrl, string launchUrl,
                string userDataDir = null)
            {
                try
                {
                    var chromeOptions = new ChromeOptions();
                    var arguments = new List<string>
                    {
                        "--start-maximized",
                        "--no-sandbox",
                        "--disable-dev-shm-usage"
                    };

                    // Set default Chrome user data directory if not specified
                    userDataDir = userDataDir ?? Path.Combine(
                        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                        "Google", "Chrome", "AutomationProfile");

                    if (!string.IsNullOrEmpty(userDataDir) && browsingMode != BrowsingModeEnum.Private)
                    {
                        Directory.CreateDirectory(userDataDir);
                        arguments.Add($"--user-data-dir={userDataDir}");
                        Console.WriteLine($"Chrome user data: {userDataDir}");
                    }

                    if (browsingMode == BrowsingModeEnum.Private) arguments.Add("--incognito");

                    chromeOptions.AddArguments(arguments);
                    var chromeService = ChromeDriverService.CreateDefaultService();
                    chromeService.HideCommandPromptWindow = true;

                    var cdriver = new ChromeDriver(chromeService, chromeOptions, TimeSpan.FromSeconds(30));
                    if (launchWithUrl && !string.IsNullOrWhiteSpace(launchUrl))
                        cdriver.Navigate().GoToUrl(launchUrl);
                    return cdriver;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Chrome Error: {ex.Message}");
                    throw;
                }
            }

            IWebDriver OpenFireFox(BrowsingModeEnum browsingMode, bool launchWithUrl, string launchUrl,
                string profilePath = null)
            {
                try
                {
                    var firefoxOptions = new FirefoxOptions();

                    // Set default Firefox profile directory if not specified
                    profilePath = profilePath ?? Path.Combine(
                        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                        "Mozilla", "Firefox", "AutomationProfile");

                    if (!string.IsNullOrEmpty(profilePath) && browsingMode != BrowsingModeEnum.Private)
                    {
                        Directory.CreateDirectory(profilePath);
                        firefoxOptions.Profile = new FirefoxProfile(profilePath);
                        Console.WriteLine($"Firefox profile: {profilePath}");
                    }

                    if (browsingMode == BrowsingModeEnum.Private)
                        firefoxOptions.SetPreference("browser.privatebrowsing.autostart", true);

                    var service = FirefoxDriverService.CreateDefaultService();
                    service.HideCommandPromptWindow = true;

                    var fdriver = new FirefoxDriver(service, firefoxOptions, TimeSpan.FromSeconds(30));

                    if (launchWithUrl && !string.IsNullOrWhiteSpace(launchUrl))
                        fdriver.Navigate().GoToUrl(launchUrl);
                    return fdriver;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Firefox Error: {ex.Message}");
                    throw;
                }
            }

            IWebDriver OpenCustomBrowser(
                string customBrowserName,
                string browserExePath,
                string driverExePath,
                BrowsingModeEnum browsingMode, bool launchWithUrl, string launchUrl,
                string userDataDir = null)
            {
                // Validate inputs
                if (string.IsNullOrWhiteSpace(customBrowserName))
                    throw new ArgumentException("Browser name cannot be empty", nameof(customBrowserName));

                if (!File.Exists(browserExePath))
                    throw new FileNotFoundException("Browser executable not found", browserExePath);

                if (!File.Exists(driverExePath))
                    throw new FileNotFoundException("Driver executable not found", driverExePath);

                try
                {
                    var driverDir = Path.GetDirectoryName(driverExePath) ??
                                    throw new InvalidOperationException("Invalid driver path");

                    // Common arguments for all browsers
                    var commonArgs = new List<string>
                    {
                        "--no-sandbox",
                        "--disable-dev-shm-usage",
                        "--disable-gpu",
                        "--disable-infobars"
                    };

                    if (customBrowserName.Equals("firefox", StringComparison.OrdinalIgnoreCase))
                    {
                        var options = new FirefoxOptions
                        {
                            BinaryLocation = browserExePath,
                            AcceptInsecureCertificates = true
                        };

                        // Handle profile persistence
                        if (!string.IsNullOrEmpty(userDataDir) && browsingMode != BrowsingModeEnum.Private)
                        {
                            Directory.CreateDirectory(userDataDir);
                            options.Profile = new FirefoxProfile(userDataDir);
                            Console.WriteLine($"Using Firefox profile: {userDataDir}");
                        }

                        if (launchWithUrl)
                            if (!string.IsNullOrEmpty(launchUrl))
                                options.AddArgument($"--url={launchUrl}");

                        if (browsingMode == BrowsingModeEnum.Private)
                            options.SetPreference("browser.privatebrowsing.autostart", true);

                        return new FirefoxDriver(driverDir, options, TimeSpan.FromSeconds(30));
                    }
                    else if (customBrowserName.Equals("chrome", StringComparison.OrdinalIgnoreCase))
                    {
                        var options = new ChromeOptions
                        {
                            BinaryLocation = browserExePath
                        };

                        // Set default Chrome user data directory if not specified
                        userDataDir = userDataDir ?? Path.Combine(
                            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                            "Google", "Chrome", "AutomationProfile");

                        if (!string.IsNullOrEmpty(userDataDir) && browsingMode != BrowsingModeEnum.Private)
                        {
                            Directory.CreateDirectory(userDataDir);
                            options.AddArguments($"--user-data-dir={userDataDir}");
                            Console.WriteLine($"Using Chrome profile: {userDataDir}");
                        }

                        options.AddArguments(commonArgs);
                        options.AddArguments(browsingMode == BrowsingModeEnum.Private
                            ? "--incognito"
                            : "--start-maximized");

                        if (launchWithUrl)
                            if (!string.IsNullOrEmpty(launchUrl))
                                options.AddArgument($"--app={launchUrl}");

                        return new ChromeDriver(driverDir, options, TimeSpan.FromSeconds(30));
                    }
                    else if (customBrowserName.Equals("edge", StringComparison.OrdinalIgnoreCase))
                    {
                        var options = new EdgeOptions
                        {
                            BinaryLocation = browserExePath
                        };

                        // Set default Edge user data directory if not specified
                        userDataDir = userDataDir ?? Path.Combine(
                            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                            "Microsoft", "Edge", "AutomationProfile");

                        if (!string.IsNullOrEmpty(userDataDir) && browsingMode != BrowsingModeEnum.Private)
                        {
                            Directory.CreateDirectory(userDataDir);
                            options.AddArguments($"--user-data-dir={userDataDir}");
                            Console.WriteLine($"Using Edge profile: {userDataDir}");
                        }

                        options.AddArguments(commonArgs);
                        options.AddArguments(browsingMode == BrowsingModeEnum.Private
                            ? "--inprivate"
                            : "--start-maximized");

                        if (launchWithUrl)
                            if (!string.IsNullOrEmpty(launchUrl))
                                options.AddArgument($"--app={launchUrl}");

                        var service =
                            EdgeDriverService.CreateDefaultService(driverDir, Path.GetFileName(driverExePath));
                        service.HideCommandPromptWindow = true;

                        return new EdgeDriver(service, options, TimeSpan.FromSeconds(30));
                    }
                    else
                    {
                        throw new NotSupportedException($"Browser '{customBrowserName}' is not supported. " +
                                                        "Supported browsers: Firefox, Chrome, Edge");
                    }
                }
                catch (WebDriverException ex)
                {
                    Console.WriteLine($"WebDriver Error ({customBrowserName}): {ex.Message}");
                    if (ex.Message.Contains("version"))
                        Console.WriteLine("Please ensure browser and driver versions match");

                    throw;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to initialize {customBrowserName}: {ex.Message}");
                    throw;
                }
            }
        }

        private static string GetBrowserName(BrowserTypeEnum browserType)
        {
            switch (browserType)
            {
                case BrowserTypeEnum.MicrosoftEdge:
                    return "Microsoft Edge";
                case BrowserTypeEnum.GoogleChrome:
                    return "Google Chrome";
                case BrowserTypeEnum.MozillaFirefox:
                    return "Mozilla Firefox";
                case BrowserTypeEnum.Custom:
                    return "Custom Browser";
                default:
                    return "Unknown";
            }
        }
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