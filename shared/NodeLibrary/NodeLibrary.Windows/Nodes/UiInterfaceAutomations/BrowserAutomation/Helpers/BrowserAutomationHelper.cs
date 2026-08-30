using NodeLibrary.BrowserAutomationNodes.Enums;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System.Diagnostics;
using System.Runtime.InteropServices;

namespace NodeLibrary.BrowserAutomationNodes.Helpers;

public class BrowserAutomationHelper
{
    [DllImport("user32.dll")]
    private static extern bool PostMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

    private const uint WM_CLOSE = 0x0010;

    public static void CloseEdgeWindowsGracefully()
    {
        foreach (var process in Process.GetProcessesByName("msedge"))
        {
            try
            {
                if (process.MainWindowHandle != IntPtr.Zero)
                {
                    PostMessage(process.MainWindowHandle, WM_CLOSE, IntPtr.Zero, IntPtr.Zero);
                }
            }
            catch { /* Handle/log as needed */ }
        }
    }

    public static IWebElement? FindElement(IWebDriver driver, ElementSelectorTypeEnum findType, string searchValue,
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


    public static By GetWebElementLocator(ElementSelectorTypeEnum findType, string searchValue)
    {
        if (string.IsNullOrWhiteSpace(searchValue))
            throw new ArgumentException("Search value cannot be null or empty.", nameof(searchValue));

        switch (findType)
        {
            case ElementSelectorTypeEnum.Id:
                return By.Id(searchValue);

            case ElementSelectorTypeEnum.XPath:
                return By.XPath(searchValue);

            case ElementSelectorTypeEnum.CssSelector:
                return By.CssSelector(searchValue);

            case ElementSelectorTypeEnum.Name:
                return By.Name(searchValue);

            case ElementSelectorTypeEnum.ClassName:
                return By.ClassName(searchValue);

            case ElementSelectorTypeEnum.TagName:
                return By.TagName(searchValue);

            case ElementSelectorTypeEnum.LinkText:
                return By.LinkText(searchValue);

            case ElementSelectorTypeEnum.PartialLinkText:
                return By.PartialLinkText(searchValue);

            case ElementSelectorTypeEnum.InnerText:
                // InnerText is not directly supported by By, but can simulate with XPath or CSS
                return By.XPath($"//*[text()='{searchValue}']");

            case ElementSelectorTypeEnum.Title:
                return By.XPath($"//*[@title='{searchValue}']");

            case ElementSelectorTypeEnum.Value:
                return By.XPath($"//*[@value='{searchValue}']");

            case ElementSelectorTypeEnum.Placeholder:
                return By.XPath($"//*[@placeholder='{searchValue}']");

            case ElementSelectorTypeEnum.Type:
                return By.XPath($"//*[@type='{searchValue}']");

            case ElementSelectorTypeEnum.DataTestId:
                return By.XPath($"//*[@data-testid='{searchValue}']");

            case ElementSelectorTypeEnum.AriaLabel:
                return By.XPath($"//*[@aria-label='{searchValue}']");

            case ElementSelectorTypeEnum.Role:
                return By.XPath($"//*[@role='{searchValue}']");

            case ElementSelectorTypeEnum.JavaScript:
                // JS-based lookup requires custom execution, not standard By locator
                throw new NotSupportedException(
                    "JavaScript-based element location is not supported in By locators.");

            case ElementSelectorTypeEnum.Sizzle:
                // Sizzle is jQuery-specific; use CssSelector or XPath instead
                return By.CssSelector(searchValue); // Fallback or treat as CSS selector

            case ElementSelectorTypeEnum.Relative:
                throw new NotSupportedException(
                    "Relative element location is not directly supported in By locators.");

            case ElementSelectorTypeEnum.AutomationId:
                // For WPF/UWP automation, consider using Appium or other tools
                return By.Id(searchValue); // Fallback for HTML automation-id (if same as id)

            default:
                throw new ArgumentException($"Unsupported find type: {findType}");
        }
    }
}