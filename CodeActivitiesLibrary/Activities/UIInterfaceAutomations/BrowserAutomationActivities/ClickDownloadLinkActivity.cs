using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities.Enums;
using CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities.Helpers;
using OpenQA.Selenium;
using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Click Download Link on Web Page")]
    [Description("Simulates clicking a download link on a web page and saves the file to the specified folder.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/BrowserAutomation.svg")]
    public class ClickDownloadLinkActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<IWebDriver> WebBrowserInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Find Type")]
        [Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
        [DefaultValue(ElementSelectorTypeEnum.XPath)]
        public InArgument<ElementSelectorTypeEnum> FindType { get; set; } =
            new InArgument<ElementSelectorTypeEnum>(ElementSelectorTypeEnum.XPath);

        [RequiredArgument]
        [DisplayName("Value To Find")]
        [Description("The selector (XPath, ID, etc.) used to locate the download link on the page.")]
        public InArgument<string> ValueToFind { get; set; }


        [RequiredArgument]
        [DisplayName("Destination Folder")]
        [Description("The full path of the folder where the downloaded file will be saved.")]
        public InArgument<string> DestinationFolder { get; set; }


        [DisplayName("Wait for File to Download")]
        [Description("If true, waits until the file appears in the destination folder.")]
        public InArgument<bool> WaitForDownload { get; set; }


        [DisplayName("Maximum Wait Time (Seconds)")]
        [Description("The maximum time to wait for the file to appear in the destination folder.")]
        [DefaultValue(30)]
        [RenderIfCondition("WaitForDownload", true)]
        public InArgument<int> MaxWaitTime { get; set; }

        [DisplayName("Downloaded File Output")]
        [Description("Returns the full path of the downloaded file.")]
        public OutArgument<string> DownloadedFile { get; set; }

        // ----------------------
        // Execution Logic
        // ---------------------- 
        protected override void Execute(CodeActivityContext context)
        {
            string status = string.Empty;
            string downloadedFilePath = null;

            try
            {
                var driver = WebBrowserInstance.Get(context);
                var findType = FindType.Get(context);
                var selector = ValueToFind.Get(context);
                var destinationFolder = DestinationFolder.Get(context);
                var waitForDownload = WaitForDownload.Get(context);
                var maxWait = MaxWaitTime.Expression != null ? MaxWaitTime.Get(context) : 30;

                if (driver == null) throw new ArgumentException("Web browser instance is null.");
                if (string.IsNullOrWhiteSpace(selector)) throw new ArgumentException("ValueToFind is empty.");
                if (string.IsNullOrWhiteSpace(destinationFolder)) throw new ArgumentException("DestinationFolder is empty.");

                if (!Directory.Exists(destinationFolder))
                    Directory.CreateDirectory(destinationFolder);

                //  Capture the list of files before the download starts
                var existingFiles = Directory.GetFiles(destinationFolder);

                // Locate and click the download element
                var by = BrowserAutomationHelper.GetWebElementLocator(findType, selector);
                var element = driver.FindElement(by);

                element.Click();

                if (waitForDownload && maxWait > 0)
                {
                    var sw = Stopwatch.StartNew();
                    bool tempDownloadStarted = false;

                    while (sw.Elapsed.TotalSeconds < maxWait)
                    {
                        var crdownloadFiles = Directory.GetFiles(destinationFolder, "*.crdownload");

                        if (crdownloadFiles.Any())
                            tempDownloadStarted = true;

                        if (tempDownloadStarted && !crdownloadFiles.Any())
                        {
                            var newFiles = Directory.GetFiles(destinationFolder)
                                .Where(f =>
                                    !f.EndsWith(".crdownload", StringComparison.OrdinalIgnoreCase) &&
                                    !f.EndsWith(".tmp", StringComparison.OrdinalIgnoreCase))
                                .Except(existingFiles)
                                .OrderByDescending(File.GetLastWriteTimeUtc)
                                .ToList();

                            if (newFiles.Any())
                            {
                                downloadedFilePath = newFiles.First();
                                break;
                            }
                        }

                        Thread.Sleep(500);
                    }

                    if (string.IsNullOrEmpty(downloadedFilePath))
                        throw new TimeoutException("File download timed out.");
                }
                else
                {
                    Thread.Sleep(2000); // give the download a moment to start
                    var postClickFiles = Directory.GetFiles(destinationFolder)
                        .Where(f => !f.EndsWith(".crdownload", StringComparison.OrdinalIgnoreCase) &&
                                    !f.EndsWith(".tmp", StringComparison.OrdinalIgnoreCase))
                        .Except(existingFiles)
                        .OrderByDescending(File.GetLastWriteTimeUtc)
                        .ToList();

                    downloadedFilePath = postClickFiles.FirstOrDefault();
                }
                DownloadedFile.Set(context, downloadedFilePath);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Download completed.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, "Download failed: " + ex.Message);
            }
        }
    }
}