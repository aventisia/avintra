using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using CodeActivitiesLibrary.Extensions;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Edge;
using OpenQA.Selenium.Firefox;

namespace CodeActivitiesLibrary.AppIntegrations.BrowserActivities
{
    [DisplayName("Launch Browser")]
    [Description("Launches a web browser instance (Edge, Chrome, Firefox) with optional window state.")]
    public sealed class LaunchBrowserActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Browser Type")]
        [Description("Specifies which browser to launch (Microsoft Edge, Google Chrome, Mozilla Firefox).")]
        [DefaultValue(BrowserTypeEnum.MicrosoftEdge)]
        public InArgument<BrowserTypeEnum> BrowserType { get; set; }

        [Category("Input")]
        [DisplayName("Browsing Mode")]
        [Description("Specifies whether to open in normal or private browsing mode.")]
        [DefaultValue(BrowsingModeEnum.Normal)]
        public InArgument<BrowsingModeEnum> BrowsingMode { get; set; }

        [Category("Input")]
        [DisplayName("Custom Browser Name")]
        [Description("Name of the custom browser (required if 'Browser Type' is 'Custom').")]
        [RenderIfCondition(nameof(BrowserType), "Custom")]
        public InArgument<string> CustomBrowserName { get; set; }

        [Category("Input")]
        [DisplayName("Browser Executable Path")]
        [Description(
            "The path to the browser executable (e.g., firefox.exe, chrome.exe). Required if 'Browser Type' is 'Custom'.")]
        [RenderIfCondition(nameof(BrowserType), "Custom")]
        public InArgument<string> BrowserExecutablePath { get; set; }

        [Category("Input")]
        [DisplayName("Driver Executable Path")]
        [Description(
            "The path to the driver executable (e.g., geckodriver.exe for Firefox). Required if 'Browser Type' is 'Custom'.")]
        [RenderIfCondition(nameof(BrowserType), "Custom")]
        public InArgument<string> DriverExecutablePath { get; set; }

        [Category("Input")]
        [DisplayName("Window State")]
        [Description("Specifies the initial browser window state.")]
        [DefaultValue(WindowStateEnum.Maximized)]
        public InArgument<WindowStateEnum> WindowState { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
        [DisplayName("Web Driver")]
        [Description("Returns the WebDriver object for further automation steps.")]
        public OutArgument<IWebDriver> WebDriver { get; set; }

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

                switch (browserType)
                {
                    case BrowserTypeEnum.MicrosoftEdge:
                        {
                            driver = OpenMicrosoftEdgeBrowser(browsingMode);
                            break;
                        }

                    case BrowserTypeEnum.GoogleChrome:
                        {
                            driver = OpenChromeBrowser(browsingMode);
                            break;
                        }

                    case BrowserTypeEnum.MozillaFirefox:
                        {
                            driver = OpenFireFox(browsingMode);
                            break;
                        }

                    case BrowserTypeEnum.Custom:
                        {
                            driver = OpenCustomBrowser(customBrowserName, browserExePath, driverExePath, browsingMode);
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

                status = $"Successfully launched {GetBrowserName(browserType)} in {windowState} mode.";
            }
            catch (Exception ex)
            {
                status = $"Error launching browser: {ex.Message}";
                driver?.Quit(); // Clean up if partially launched
                driver = null;
            }

            WebDriver.Set(context, driver);
            StatusMessage.Set(context, status);
            return;

            IWebDriver OpenFireFox(BrowsingModeEnum browsingMode)
            {
                try
                {
                    var firefoxOptions = new FirefoxOptions();
                    firefoxOptions.SetPreference("dom.disable_beforeunload", true);

                    if (browsingMode == BrowsingModeEnum.Private)
                        firefoxOptions.AddArgument("-private");

                    var service = FirefoxDriverService.CreateDefaultService();
                    service.HideCommandPromptWindow = true;


                    driver = new FirefoxDriver(service, firefoxOptions);
                    return driver;
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    throw;
                }
            }

            IWebDriver OpenChromeBrowser(BrowsingModeEnum browsingMode)
            {
                try
                {
                    var chromeOptions = new ChromeOptions();
                    chromeOptions.AddArgument("start-maximized");
                    chromeOptions.AddArguments(browsingMode == BrowsingModeEnum.Private ? "--incognito" : "");

                    var chromeService = ChromeDriverService.CreateDefaultService();

                    driver = new ChromeDriver(chromeService, chromeOptions);
                    // driver = new ChromeDriver();
                    return driver;
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    throw;
                }
            }

            IWebDriver OpenMicrosoftEdgeBrowser(BrowsingModeEnum browsingMode)
            {
                try
                {
                    var edgeOptions = new EdgeOptions();
                    edgeOptions.AddArgument("start-maximized");
                    edgeOptions.AddArguments(browsingMode == BrowsingModeEnum.Private ? "--inprivate" : "");

                    var edgeService = EdgeDriverService.CreateDefaultService();
                    edgeService.HideCommandPromptWindow = true;

                    driver = new EdgeDriver(edgeService, edgeOptions);
                    return driver;
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    throw;
                }
            }

            IWebDriver OpenCustomBrowser(string customBrowserName, string browserExePath, string driverExePath,
                BrowsingModeEnum browsingMode)
            {
                if (string.IsNullOrWhiteSpace(customBrowserName) ||
                    string.IsNullOrWhiteSpace(browserExePath) ||
                    string.IsNullOrWhiteSpace(driverExePath))
                    throw new ArgumentException("Custom browser requires name, browser path, and driver path.");

                if (!File.Exists(browserExePath))
                    throw new FileNotFoundException("Browser executable not found.", browserExePath);

                if (!File.Exists(driverExePath))
                    throw new FileNotFoundException("Driver executable not found.", driverExePath);

                // Example fallback logic - can be extended to other browsers
                if (customBrowserName.Equals("firefox", StringComparison.OrdinalIgnoreCase))
                {
                    var options = new FirefoxOptions
                    {
                        BinaryLocation = browserExePath
                    };

                    if (browsingMode == BrowsingModeEnum.Private)
                        options.AddArgument("-private");

                    driver = new FirefoxDriver(
                        Path.GetDirectoryName(driverExePath) ?? throw new InvalidOperationException(), options);
                }
                else if (customBrowserName.Equals("chrome", StringComparison.OrdinalIgnoreCase))
                {
                    var options = new ChromeOptions
                    {
                        BinaryLocation = browserExePath
                    };
                    options.AddArguments(browsingMode == BrowsingModeEnum.Private ? "--incognito" : "");
                    options.AddArgument("start-maximized");

                    driver = new ChromeDriver(
                        Path.GetDirectoryName(driverExePath) ?? throw new InvalidOperationException(), options);
                }
                else if (customBrowserName.Equals("edge", StringComparison.OrdinalIgnoreCase))
                {
                    var options = new EdgeOptions
                    {
                        BinaryLocation = browserExePath
                    };
                    options.AddArguments(browsingMode == BrowsingModeEnum.Private ? "--inprivate" : "");
                    options.AddArgument("start-maximized");

                    var service = EdgeDriverService.CreateDefaultService(
                        Path.GetDirectoryName(driverExePath),
                        Path.GetFileName(driverExePath));
                    service.HideCommandPromptWindow = true;

                    driver = new EdgeDriver(service, options);
                }
                else
                {
                    throw new NotSupportedException($"'{customBrowserName}' is not supported.");
                }

                return driver;
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