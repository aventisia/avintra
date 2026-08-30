using NodeLibrary.BrowserAutomationNodes.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Edge;
using System.Diagnostics;
using System.Management;
using System.Net;
using System.Net.Sockets;
using WebDriverManager;
using WebDriverManager.DriverConfigs.Impl;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("Launch Browser"), Description("Launches a web browser instance of Microsoft Edge or Google Chrome.")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg")]
public sealed class LaunchBrowserNode : BaseNode
{
    [DisplayName("Browser Type"), Description("Specifies which browser to launch (Microsoft Edge, Google Chrome).")]
    public InArgument<BrowserTypeEnum> BrowserType { get; set; } = new InArgument<BrowserTypeEnum>(BrowserTypeEnum.MicrosoftEdge);

    [DisplayName("Launch Url"), Description("The URL to launch the browser with. If empty, the browser will launch without navigating to a specific page.")]
    public InArgument<string> LaunchUrl { get; set; } = new InArgument<string>("");

    [DisplayName("Browsing Mode"), Description("Specifies whether to open in normal or private mode.")]
    public InArgument<BrowsingModeEnum> BrowsingMode { get; set; } = new InArgument<BrowsingModeEnum>(BrowsingModeEnum.Normal);

    [DisplayName("Window State"), Description("Specifies the initial browser window state.")]
    public InArgument<WindowStateEnum> WindowState { get; set; } = new InArgument<WindowStateEnum>(WindowStateEnum.Maximized);

    [DisplayName("Web Browser"), Description("Returns the Web browser instance.")]
    public OutArgument<IWebDriver> WebBrowserInstance { get; set; } = new OutArgument<IWebDriver>();

    protected override void Execute(INodeContext context)
    {
        var browserType = BrowserType.Get(context);
        var processName = GetBrowserProcessName(browserType);
        var launchUrl = LaunchUrl.Get(context);
        var browsingMode = BrowsingMode.Get(context);
        var windowState = WindowState.Get(context);

        IWebDriver? webDriver = null;
        var appDataFolder = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
        launchUrl = string.IsNullOrWhiteSpace(launchUrl) ? "data:" : launchUrl;

        try
        {
            switch (browserType)
            {
                case BrowserTypeEnum.MicrosoftEdge:
                    KillProcesses("msedgedriver");
                    BrowserAutomationHelper.CloseEdgeWindowsGracefully();
                    Thread.Sleep(2000);
                    KillProcesses("msedge");

                    var edgeExecutablePath = FindBrowserExecutable(BrowserTypeEnum.MicrosoftEdge);
                    var edgeVersion = GetBrowserVersion(edgeExecutablePath);
                    new DriverManager().SetUpDriver(new EdgeConfig(), version: edgeVersion);

                    var edgeUserDataDir = Path.Combine(appDataFolder, "Microsoft", "Edge", "User Data");
                    var edgeService = EdgeDriverService.CreateDefaultService();
                    edgeService.HideCommandPromptWindow = true;
                    var edgeOptions = new EdgeOptions();
                    edgeOptions.AddArgument($"--user-data-dir={edgeUserDataDir}");
                    edgeOptions.AddArgument("--profile-directory=Default");
                    if (browsingMode == BrowsingModeEnum.Private) edgeOptions.AddArgument("--inprivate");
                    edgeOptions.BinaryLocation = edgeExecutablePath;
                    webDriver = new EdgeDriver(edgeService, edgeOptions);
                    break;

                case BrowserTypeEnum.GoogleChrome:
                    KillProcesses("chromedriver");

                    var chromeExecutablePath = FindBrowserExecutable(BrowserTypeEnum.GoogleChrome);
                    var chromeVersion = GetBrowserVersion(chromeExecutablePath);
                    new DriverManager().SetUpDriver(new ChromeConfig(), version: chromeVersion);

                    var chromeUserDataDir = Path.Combine(appDataFolder, "Google", "Chrome", "User Data");
                    var chromePort = GetPortOfRunningChromiumWithRemoteDebugging(processName, chromeUserDataDir);

                    if (chromePort == null)
                    {
                        chromePort = GetAvailablePort().ToString();
                        string arguments = $"--remote-debugging-port={chromePort} --user-data-dir=\"{chromeUserDataDir}\" --profile-directory=Default {launchUrl}";
                        if (browsingMode == BrowsingModeEnum.Private)
                            arguments += " --incognito";

                        var process = new Process();
                        process.StartInfo.FileName = chromeExecutablePath;
                        process.StartInfo.Arguments = arguments;
                        process.StartInfo.UseShellExecute = false;
                        process.Start();
                    }

                    var chromeService = ChromeDriverService.CreateDefaultService();
                    chromeService.HideCommandPromptWindow = true;
                    var chromeOptions = new ChromeOptions();
                    chromeOptions.DebuggerAddress = $"localhost:{chromePort}";
                    webDriver = new ChromeDriver(chromeService, chromeOptions);
                    break;

                default:
                    throw new ArgumentException($"Unsupported browser type: {browserType}");
            }

            SelectBestWindow(webDriver, launchUrl);

            if (webDriver != null && !string.IsNullOrWhiteSpace(launchUrl))
                webDriver.Navigate().GoToUrl(launchUrl);

            ApplyWindowState(webDriver, windowState);

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
                process.Kill();
        }
        catch (Exception ex)
        {
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
        if (!Uri.TryCreate(launchUrl, UriKind.Absolute, out Uri? uri))
            return false;
        return uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps;
    }

    private static void SelectBestWindow(IWebDriver webDriver, string launchUrl)
    {
        if (webDriver == null || webDriver.WindowHandles.Count == 0)
            return;

        var windowHandles = webDriver.WindowHandles;
        var selectedWindowHandle = windowHandles[0];
        string? fallbackContentWindowHandle = null;
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
                    fallbackContentWindowHandle = handle;
            }
            catch { }
        }

        if (fallbackContentWindowHandle != null)
            selectedWindowHandle = fallbackContentWindowHandle;

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
        return browserType switch
        {
            BrowserTypeEnum.MicrosoftEdge => "msedge.exe",
            BrowserTypeEnum.GoogleChrome => "chrome.exe",
            _ => "Not Supported"
        };
    }

    private static void ApplyWindowState(IWebDriver? webDriver, WindowStateEnum windowState)
    {
        if (webDriver == null)
            return;

        // Allow the browser window a moment to finish initializing before changing state.
        Thread.Sleep(500);

        var window = webDriver.Manage().Window;
        if (windowState == WindowStateEnum.Minimized)
        {
            try
            {
                window.Minimize();
            }
            catch
            {
                // Ignore window-state failures and continue.
            }
            return;
        }

        if (windowState == WindowStateEnum.Maximized)
        {
            // Retry maximize a couple of times; Chrome may report it is already maximized.
            for (int i = 0; i < 3; i++)
            {
                try
                {
                    window.Maximize();
                    return;
                }
                catch (Exception ex) when (ex.Message.Contains("failed to change window state"))
                {
                    if (i == 2) return; // Already in target state or transient; ignore.
                    Thread.Sleep(200);
                }
                catch
                {
                    // Other errors are not retried.
                    return;
                }
            }
        }
    }

    private static string? GetBrowserVersion(string executablePath)
    {
        try
        {
            var info = FileVersionInfo.GetVersionInfo(executablePath);
            return info.FileVersion;
        }
        catch
        {
            return null;
        }
    }

    private static string FindBrowserExecutable(BrowserTypeEnum browserType)
    {
        string fileName = browserType switch
        {
            BrowserTypeEnum.MicrosoftEdge => "msedge.exe",
            BrowserTypeEnum.GoogleChrome => "chrome.exe",
            _ => throw new ArgumentException($"Unsupported browser type: {browserType}")
        };

        string[] candidatePaths = browserType switch
        {
            BrowserTypeEnum.MicrosoftEdge => new[]
            {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "Microsoft", "Edge", "Application", "msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "Microsoft", "Edge", "Application", "msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Microsoft", "Edge", "Application", "msedge.exe")
            },
            BrowserTypeEnum.GoogleChrome => new[]
            {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "Google", "Chrome", "Application", "chrome.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "Google", "Chrome", "Application", "chrome.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Google", "Chrome", "Application", "chrome.exe")
            },
            _ => Array.Empty<string>()
        };

        foreach (var path in candidatePaths)
        {
            if (File.Exists(path))
                return path;
        }

        // Fall back to PATH resolution
        var pathEnv = Environment.GetEnvironmentVariable("PATH") ?? string.Empty;
        foreach (var dir in pathEnv.Split(Path.PathSeparator, StringSplitOptions.RemoveEmptyEntries))
        {
            var path = Path.Combine(dir.Trim(), fileName);
            if (File.Exists(path))
                return path;
        }

        throw new FileNotFoundException($"Could not locate {fileName}. Please ensure {browserType} is installed and its directory is on the system PATH.", fileName);
    }

    private static string? GetPortOfRunningChromiumWithRemoteDebugging(string processName, string userDataDir)
    {
        try
        {
            var mngmtClass = new ManagementClass("Win32_Process");
            foreach (ManagementObject obj in mngmtClass.GetInstances())
            {
                var nameObj = obj["Name"];
                var cmdLineObj = obj["CommandLine"];
                if (nameObj != null && nameObj.ToString()!.Equals(processName, StringComparison.OrdinalIgnoreCase)
                    && cmdLineObj != null && cmdLineObj.ToString()!.Contains(userDataDir))
                {
                    var cmdLine = cmdLineObj.ToString()!;
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
    Minimized
}
