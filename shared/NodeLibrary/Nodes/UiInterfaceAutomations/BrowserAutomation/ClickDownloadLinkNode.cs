using NodeLibrary.BrowserAutomationNodes.Enums;
using NodeLibrary.BrowserAutomationNodes.Helpers;
using OpenQA.Selenium;
using System.Diagnostics;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("Click Download Link on Web Page"), Description("Simulates clicking a download link on a web page and saves the file to the specified folder.")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg")]
public class ClickDownloadLinkNode : BaseNode
{
    [DisplayName("Web Browser Instance"), Description("Enter or choose the variable that contains the web browser instance to work with.")]
    public required InArgument<IWebDriver> WebBrowserInstance { get; set; }

    [DisplayName("Find Type"), Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
    public InArgument<ElementSelectorTypeEnum> FindType { get; set; } = new InArgument<ElementSelectorTypeEnum>(ElementSelectorTypeEnum.XPath);

    [DisplayName("Value To Find"), Description("The selector (XPath, ID, etc.) used to locate the download link on the page.")]
    public required InArgument<string> ValueToFind { get; set; }

    [DisplayName("Destination Folder"), Description("The full path of the folder where the downloaded file will be saved.")]
    public required InArgument<string> DestinationFolder { get; set; }

    [DisplayName("Wait for File to Download"), Description("If true, waits until the file appears in the destination folder.")]
    public InArgument<bool> WaitForDownload { get; set; } = new InArgument<bool>(false);

    [DisplayName("Maximum Wait Time (Seconds)"), Description("The maximum time to wait for the file to appear in the destination folder.")]
    [RenderIfCondition("WaitForDownload", true)]
    public InArgument<int> MaxWaitTime { get; set; } = new InArgument<int>(30);

    [DisplayName("Downloaded File Output"), Description("Returns the full path of the downloaded file.")]
    public OutArgument<string> DownloadedFile { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        string? downloadedFilePath = null;

        try
        {
            var driver = WebBrowserInstance.Get(context);
            var findType = FindType.Get(context);
            var selector = ValueToFind.Get(context);
            var destinationFolder = DestinationFolder.Get(context);
            var waitForDownload = WaitForDownload.Get(context);
            var maxWait = MaxWaitTime.Get(context);

            if (driver == null) throw new ArgumentException("Web browser instance is null.");
            if (string.IsNullOrWhiteSpace(selector)) throw new ArgumentException("ValueToFind is empty.");
            if (string.IsNullOrWhiteSpace(destinationFolder)) throw new ArgumentException("DestinationFolder is empty.");

            if (!Directory.Exists(destinationFolder))
                Directory.CreateDirectory(destinationFolder);

            // Capture the list of files before the download starts
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
                Thread.Sleep(2000);
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
