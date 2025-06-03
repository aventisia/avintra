using OpenQA.Selenium;
using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Click Download Link on Web Page")]
    [Description("Simulates clicking a download link on a web page and saves the file to the specified folder.")]
    public class ClickDownloadLinkActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]

        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<IWebDriver> WebBrowserInstance { get; set; }

        [RequiredArgument]

        [DisplayName("UI Element")]
        [Description("The selector (XPath, ID, etc.) used to locate the download link on the page.")]
        public InArgument<string> UiElement { get; set; }

        [RequiredArgument]

        [DisplayName("Find Type")]
        [Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
        public InArgument<string> FindType { get; set; }

        [RequiredArgument]

        [DisplayName("Destination Folder")]
        [Description("The full path of the folder where the downloaded file will be saved.")]
        public InArgument<string> DestinationFolder { get; set; }


        [DisplayName("Wait for File to Download")]
        [Description("If true, waits until the file appears in the destination folder.")]
        public InArgument<bool> WaitForDownload { get; set; }


        [DisplayName("Maximum Wait Time (Seconds)")]
        [Description("The maximum time to wait for the file to appear in the destination folder.")]
        public InArgument<int> MaxWaitTime { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Downloaded File Output")]
        [Description("Returns the full path of the downloaded file.")]
        public OutArgument<string> DownloadedFile { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            string downloadedFilePath = null;

            try
            {
                var driver = WebBrowserInstance.Get(context);
                var uiElement = UiElement.Get(context);
                var findType = FindType.Get(context);
                var destinationFolder = DestinationFolder.Get(context);
                var waitForDownload = WaitForDownload.Get(context);
                var maxWaitTime = MaxWaitTime.Get(context);

                if (driver == null)
                    throw new ArgumentException("Web browser instance cannot be null.");

                if (string.IsNullOrWhiteSpace(uiElement))
                    throw new ArgumentException("UI Element cannot be empty.");

                if (string.IsNullOrWhiteSpace(findType))
                    throw new ArgumentException("Find type must be specified.");

                if (!Directory.Exists(destinationFolder))
                    Directory.CreateDirectory(destinationFolder);

                // Locate the download link
                var by = GetLocator(findType, uiElement);
                var element = driver.FindElement(by);
                if (element == null)
                    throw new ArgumentException($"No element found using '{findType}': '{uiElement}'");

                // Click the element to trigger download
                element.Click();

                // Optionally wait for file to appear in destination folder
                if (waitForDownload && maxWaitTime > 0)
                {
                    var fileName = Path.Combine(destinationFolder, "*.crdownload");
                    var timeout = TimeSpan.FromSeconds(maxWaitTime);
                    var sw = new Stopwatch();
                    sw.Start();

                    while (sw.Elapsed < timeout)
                    {
                        var files = Directory.GetFiles(destinationFolder, "*.*", SearchOption.TopDirectoryOnly)
                            .Where(f => !f.EndsWith(".crdownload") && !f.EndsWith(".tmp"))
                            .ToList();

                        if (files.Count > 0)
                        {
                            downloadedFilePath = files[0];
                            break;
                        }

                        Thread.Sleep(500);
                    }

                    sw.Stop();

                    if (string.IsNullOrEmpty(downloadedFilePath))
                        throw new TimeoutException("File did not finish downloading within the specified time.");
                }
                else
                {
                    status += " File download initiated but not waited for.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error during download: {ex.Message}";
            }

            StatusMessage.Set(context, status);
            DownloadedFile.Set(context, downloadedFilePath);
        }

        private static By GetLocator(string findType, string searchValue)
        {
            switch (findType.ToLower())
            {
                case "id":
                    return By.Id(searchValue);
                case "name":
                    return By.Name(searchValue);
                case "xpath":
                    return By.XPath(searchValue);
                case "cssselector":
                    return By.CssSelector(searchValue);
                case "classname":
                    return By.ClassName(searchValue);
                case "linktext":
                    return By.LinkText(searchValue);
                case "partiallinktext":
                    return By.PartialLinkText(searchValue);
                case "tagname":
                    return By.TagName(searchValue);
                default:
                    throw new ArgumentException($"Unsupported find type: {findType}");
            }
        }
    }
}