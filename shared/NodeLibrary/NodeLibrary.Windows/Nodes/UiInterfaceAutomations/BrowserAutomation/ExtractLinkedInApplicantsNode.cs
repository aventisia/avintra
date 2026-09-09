using NodeLibrary.Office;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System.IO;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("Extract LinkedIn Applicants"),
 Description("Extracts LinkedIn applicants from a job posting, writes applicant data to Excel, downloads resumes, and moves files to a target folder.")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg", supportedPlatforms: "windows")]
public class ExtractLinkedInApplicantsNode : BaseNode
{
    [DisplayName("Web Browser Instance"), Description("Web browser instance used to navigate LinkedIn.")]
    public required InArgument<IWebDriver> WebBrowserInstance { get; set; }

    [DisplayName("Job Posting Url"), Description("LinkedIn job posting applicants URL to process.")]
    public required InArgument<string> JobPostingUrl { get; set; }

    [DisplayName("Worksheet Instance"), Description("Excel worksheet where applicant details will be saved. Expected to have headers in same order: Applicant Name, Applicant Key, Applicant Url, Profile URL, Location, Email, Phone, Resume Saved Path, Resume Status, Processing Status, Processed At, Error Message, Page No, Applicant No.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("Destination Folder"), Description("Folder where downloaded resume files will be moved.")]
    public required InArgument<string> DestinationFolder { get; set; }

    [DisplayName("Retry Count"), Description("Number of retries for transient applicant processing failures.")]
    public InArgument<int> RetryCount { get; set; } = new InArgument<int>(2);

    [DisplayName("Timeout Seconds"), Description("Maximum wait time for browser operations and downloads.")]
    public InArgument<int> TimeoutSeconds { get; set; } = new InArgument<int>(60);

    [DisplayName("Processed Count"), Description("Number of applicants processed in this run.")]
    public OutArgument<int> ProcessedCount { get; set; } = new OutArgument<int>();

    [DisplayName("Skipped Count"), Description("Number of applicants skipped because they were already processed.")]
    public OutArgument<int> SkippedCount { get; set; } = new OutArgument<int>();

    [DisplayName("Failed Count"), Description("Number of applicants that failed to process.")]
    public OutArgument<int> FailedCount { get; set; } = new OutArgument<int>();

    [DisplayName("Last Processed Key"), Description("Last processed applicant key (normalized profile URL).")]
    public OutArgument<string> LastProcessedKey { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        int processedCount = 0;
        int skippedCount = 0;
        int failedCount = 0;
        string lastProcessedKey = string.Empty;

        try
        {
            // Get parameters
            var driver = WebBrowserInstance.Get(context);
            var jobPostingUrl = JobPostingUrl.Get(context);
            dynamic? worksheet = WorksheetInstance.Get(context);
            var destinationFolder = DestinationFolder.Get(context);
            var retryCount = Math.Max(0, RetryCount.Get(context));
            var timeoutSeconds = TimeoutSeconds.Get(context);
            var downloadsFolder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Downloads");

            // Validate inputs
            if (driver == null) throw new ArgumentException("Web browser instance is null.");
            if (worksheet == null) throw new ArgumentException("Worksheet instance is null.");
            if (string.IsNullOrWhiteSpace(jobPostingUrl)) throw new ArgumentException("Job posting URL is required.");
            if (string.IsNullOrWhiteSpace(destinationFolder)) throw new ArgumentException("Destination folder is required.");
            if (!Directory.Exists(downloadsFolder)) throw new DirectoryNotFoundException("Default Downloads folder was not found.");

            // Ensure destination folder exists
            if (!Directory.Exists(destinationFolder)) Directory.CreateDirectory(destinationFolder);

            // Load already processed profiles to avoid duplicates
            int applicantKeyCol = GetHeaderColumnIndex(worksheet, "Applicant Key");
            int processingStatusCol = GetHeaderColumnIndex(worksheet, "Processing Status");
            var processedProfiles = LoadProcessedProfileUrls(worksheet, applicantKeyCol, processingStatusCol);

            // Navigate to job posting url and wait for applicant list to load
            driver.Navigate().GoToUrl(jobPostingUrl);
            WaitForApplicantList(driver, timeoutSeconds);

            bool hasNextPage = true;
            int pageGuard = 0;

            while (hasNextPage && pageGuard < 100)
            {
                pageGuard++;
                WaitForApplicantList(driver, timeoutSeconds);

                // Extract applicants count on current page
                int applicantCount = driver.FindElements(By.XPath("//li[contains(@class, 'hiring-applicants__list-item')]"))?.Count ?? 0;

                // If applicant count is less than 25, it could indicate that the list is still loading (LinkedIn loads applicants in batches), so we wait a bit and re-check before proceeding to avoid stale element references.
                if (applicantCount < 25)
                {
                    for (int i = 0; i < 10; i++)
                    {
                        Thread.Sleep(500);
                        applicantCount = driver.FindElements(By.XPath("//li[contains(@class, 'hiring-applicants__list-item')]"))?.Count ?? 0;
                        if (applicantCount == 25) break;
                    }
                }

                // Process each applicant in the list
                for (int index = 1; index <= applicantCount; index++)
                {
                    // Guard against stale element reference by re-finding the list item each time
                    var listItem = GetApplicantListItem(driver, index);
                    if (listItem == null) continue;

                    // Extract a unique applicant key
                    var (applicantKey, applicantUrl) = ExtractApplicantKeyFromListItem(listItem);

                    // Check if applicant key from the list is already processed to skip early
                    if (!string.IsNullOrWhiteSpace(applicantKey) && processedProfiles.Contains(applicantKey))
                    {
                        skippedCount++;
                        processedProfiles.Add(applicantKey);
                        lastProcessedKey = applicantKey;
                        continue;
                    }

                    // Set applicant record
                    ApplicantRecord? record = null;
                    Exception? lastError = null;

                    // Retry logic for transient failures during applicant processing
                    for (int attempt = 0; attempt <= retryCount; attempt++)
                    {
                        try
                        {
                            // Re-find the list item to avoid stale element reference exceptions
                            listItem = GetApplicantListItem(driver, index);
                            if (listItem == null)
                            {
                                throw new InvalidOperationException($"Applicant list item {index} is not available.");
                            }

                            // Click the applicant to load details within the same page (LinkedIn uses dynamic content loading)
                            ClickWebElement(driver, listItem);
                            Thread.Sleep(1000);

                            // Extract applicant details
                            record = ExtractApplicantRecord(driver, listItem, applicantKey);
                            record.ApplicantUrl = applicantUrl;
                            record.ProcessedAt = DateTime.Now;

                            // Attempt to download resume and move to destination folder
                            var downloadResult = TryDownloadAndMoveResume(
                                driver,
                                downloadsFolder,
                                destinationFolder,
                                record,
                                timeoutSeconds);

                            // Update record with download results
                            record.ResumeStatus = downloadResult.ResumeStatus;
                            record.ResumeSavedPath = downloadResult.ResumeSavedPath;
                            record.ErrorMessage = record.ErrorMessage + downloadResult.CustomNotes;
                            record.ProcessingStatus = downloadResult.ResumeStatus;

                            // Small delay to avoid overwhelming the server or hitting rate limits
                            Thread.Sleep(1000);

                            // Write applicant record to Excel
                            WriteApplicantRow(worksheet, record, pageGuard, index);
                            processedCount++;

                            // Break out of retry loop on success
                            record = null;
                            lastError = null;
                            break;
                        }
                        catch (Exception ex)
                        {
                            lastError = ex;
                            if (attempt < retryCount)
                            {
                                Thread.Sleep(1000);
                            }
                        }
                    }

                    if (record == null && lastError == null)
                    {
                        continue;
                    }

                    if (lastError != null)
                    {
                        failedCount++;

                        var failureRecord = record ?? new ApplicantRecord();
                        if (string.IsNullOrWhiteSpace(failureRecord.ProfileUrl))
                        {
                            failureRecord.ProfileUrl = applicantKey;
                        }

                        failureRecord.ResumeStatus = string.IsNullOrWhiteSpace(failureRecord.ResumeStatus)
                            ? "Error"
                            : failureRecord.ResumeStatus;
                        failureRecord.ProcessingStatus = "Failed";
                        failureRecord.ErrorMessage = lastError.Message;
                        failureRecord.ProcessedAt = DateTime.Now;

                        WriteApplicantRow(worksheet, failureRecord, pageGuard, index);
                    }
                }

                hasNextPage = TryGoToNextApplicantsPage(driver, timeoutSeconds);
            }

            ProcessedCount.Set(context, processedCount);
            SkippedCount.Set(context, skippedCount);
            FailedCount.Set(context, failedCount);
            LastProcessedKey.Set(context, lastProcessedKey);

            IsSuccess.Set(context, true);
            StatusMessage.Set(context,
                $"Completed LinkedIn applicant extraction. Processed={processedCount}, Skipped={skippedCount}, Failed={failedCount}.");
        }
        catch (Exception ex)
        {
            ProcessedCount.Set(context, processedCount);
            SkippedCount.Set(context, skippedCount);
            FailedCount.Set(context, failedCount);
            LastProcessedKey.Set(context, lastProcessedKey);

            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"LinkedIn extraction failed: {ex.Message}");
        }
    }

    private static IWebElement? GetApplicantListItem(IWebDriver driver, int index)
    {
        try
        {
            return driver.FindElement(By.XPath($"(//li[contains(@class, 'hiring-applicants__list-item')])[{index}]"));
        }
        catch
        {
            return null;
        }
    }

    private static (string, string) ExtractApplicantKeyFromListItem(IWebElement listItem)
    {
        try
        {
            var href = listItem
                .FindElements(By.XPath(".//a[contains(@href,'/hiring/jobs/') and contains(@href,'/applicants/') and contains(@href,'/detail/')]"))
                .FirstOrDefault()
                ?.GetAttribute("href");

            if (string.IsNullOrWhiteSpace(href))
            {
                return (string.Empty, string.Empty);
            }

            // Example:
            // /hiring/jobs/4385214110/applicants/38248794526/detail/?...
            var m = Regex.Match(
                href,
                @"/hiring/jobs/(?<job>\d+)/applicants/(?<app>\d+)/detail",
                RegexOptions.IgnoreCase);

            if (!m.Success)
            {
                return (string.Empty, string.Empty);
            }

            // Safer unique key across jobs
            return (m.Groups["job"].Value + "_" + m.Groups["app"].Value, href);
        }
        catch
        {
            return (string.Empty, string.Empty);
        }
    }

    private static int GetHeaderColumnIndex(dynamic worksheet, string headerName)
    {
        for (int i = 1; i <= 20; i++)
        {
            var existing = Convert.ToString(worksheet.Cells[1, i].Value2)?.Trim();
            if (string.Equals(existing, headerName, StringComparison.OrdinalIgnoreCase))
            {
                return i;
            }
        }

        throw new InvalidOperationException($"Header '{headerName}' not found in worksheet.");
    }

    private static HashSet<string> LoadProcessedProfileUrls(
        dynamic worksheet,
        int applicantKeyColumn,
        int processingStatusColumn)
    {
        var processed = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        int lastRow = worksheet.Cells[worksheet.Rows.Count, applicantKeyColumn]
            .End[OfficeConstants.XlUp]
            .Row;

        if (lastRow < 2)
        {
            return processed;
        }

        for (int row = 2; row <= lastRow; row++)
        {
            var applicantKey = Convert.ToString(worksheet.Cells[row, applicantKeyColumn].Value2)?.Trim();
            var normalized = NormalizeProfileUrl(applicantKey);
            var processingStatus = Convert.ToString(worksheet.Cells[row, processingStatusColumn].Value2)?.Trim();

            // Failed rows should be retried on reruns, so they are not considered processed.
            if (string.Equals(processingStatus, "Failed", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            if (!string.IsNullOrWhiteSpace(normalized))
            {
                processed.Add(normalized);
            }
        }

        return processed;
    }

    private static int GetNextEmptyRow(dynamic worksheet)
    {
        int lastRow = worksheet.Cells[worksheet.Rows.Count, 1]
            .End[OfficeConstants.XlUp]
            .Row;

        if (lastRow < 1)
        {
            return 2;
        }

        if (lastRow == 1)
        {
            var firstCell = Convert.ToString(worksheet.Cells[1, 1].Value2);
            return string.IsNullOrWhiteSpace(firstCell) ? 1 : 2;
        }

        return lastRow + 1;
    }

    private static void WriteApplicantRow(dynamic worksheet, ApplicantRecord record, int pageNo, int recordNo)
    {
        int row = GetNextEmptyRow(worksheet);
        worksheet.Cells[row, 1] = record.ApplicantName ?? string.Empty;
        worksheet.Cells[row, 2] = record.ApplicantKey ?? string.Empty;
        worksheet.Cells[row, 3] = record.ApplicantUrl ?? string.Empty;
        worksheet.Cells[row, 4] = NormalizeProfileUrl(record.ProfileUrl) ?? string.Empty;
        worksheet.Cells[row, 5] = record.Location ?? string.Empty;
        worksheet.Cells[row, 6] = record.Email ?? string.Empty;
        worksheet.Cells[row, 7] = record.Phone ?? string.Empty;
        worksheet.Cells[row, 8] = record.ResumeSavedPath ?? string.Empty;
        worksheet.Cells[row, 9] = record.ResumeStatus ?? string.Empty;
        worksheet.Cells[row, 10] = record.ProcessingStatus ?? string.Empty;
        worksheet.Cells[row, 11] = record.ProcessedAt == default(DateTime)
            ? DateTime.Now.ToString("o")
            : record.ProcessedAt.ToString("o");
        worksheet.Cells[row, 12] = record.ErrorMessage ?? string.Empty;
        worksheet.Cells[row, 13] = pageNo;
        worksheet.Cells[row, 14] = recordNo;
    }

    private static void WaitForApplicantList(IWebDriver driver, int timeoutSeconds)
    {
        var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(timeoutSeconds));
        wait.Until(drv => drv.FindElements(By.XPath("//li[contains(@class, 'hiring-applicants__list-item')]"))?.Count > 0);
    }

    private static ApplicantRecord ExtractApplicantRecord(
        IWebDriver driver,
        IWebElement listItem,
        string applicantKey)
    {
        var record = new ApplicantRecord
        {
            ApplicantName = SafeExtractText(driver,
                        "//ul/li[contains(@class,'hiring-applicants__list-item') and contains(@class,'selected')]//div[contains(@class, 'hiring-people-card__title')]",
                        "//div[contains(@class,'hiring-applicant-detail')]//h2",
                        "//div[contains(@class,'artdeco-entity-lockup__title') and contains(@class, 'hiring-people-card__title')]"),
            ApplicantKey = applicantKey,
            ProfileUrl = string.Empty,
            Location = SafeExtractText(driver,
                        "(//div[contains(@class,'hiring-applicant-header')]//div[contains(@class,'t-16') and not(contains(@class,'display-flex'))])[2]",
                        "//div[contains(@class,'hiring-applicant-header')]//div[contains(@class,'t-16') and not(contains(@class,'display-flex')) and contains(text(),',')]")
        };

        var profileFromDetails = ExtractProfileUrlFromDetailPanel(driver);
        if (!string.IsNullOrWhiteSpace(profileFromDetails))
        {
            record.ProfileUrl = NormalizeProfileUrl(profileFromDetails);
        }

        // 1. Click "More" to open the dropdown
        var moreButton = FindFirstVisibleElement(driver,
            "//div[contains(@class,'hiring-applicant-header-actions')]//button[.//span[normalize-space(text())='See more options']]",
            "//div[contains(@class,'hiring-applicant-header-actions')]//button[contains(@class,'artdeco-button--secondary') and contains(@class,'artdeco-button--muted')]");
        if (moreButton != null)
        {
            ClickWebElement(driver, moreButton);
            Thread.Sleep(1000);
        }

        // Extract email from mailto: href attribute (works even on aria-hidden elements)
        try
        {
            var emailAnchor = driver.FindElements(By.XPath(
                "//div[contains(@class,'hiring-applicant-header-actions__dropdown-content')]//a[contains(@href,'mailto:')]"))
                .FirstOrDefault();

            var mailtoHref = emailAnchor?.GetAttribute("href") ?? string.Empty;
            if (mailtoHref.StartsWith("mailto:", StringComparison.OrdinalIgnoreCase))
            {
                record.Email = mailtoHref.Substring(7).Split('?')[0].Trim();
            }
        }
        catch { }

        try
        {
            // Prefer a11y text: "Copy phone number <value> to clipboard"
            var a11yPhone = driver.FindElements(By.XPath(
                "//div[contains(@class,'hiring-applicant-header-actions__more-content-dropdown-item-info')]" +
                "[.//span[contains(normalize-space(.),'Copy phone number') and contains(normalize-space(.),'to clipboard')]]" +
                "//span[contains(@class,'a11y-text')]"))
                .FirstOrDefault();

            var a11yText = a11yPhone?.GetAttribute("textContent")?.Trim() ?? string.Empty;
            if (!string.IsNullOrWhiteSpace(a11yText))
            {
                // Capture whatever is between "Copy phone number" and "to clipboard"
                var m = Regex.Match(
                    a11yText,
                    @"Copy\s+phone\s+number\s+(.+?)\s+to\s+clipboard",
                    RegexOptions.IgnoreCase);

                if (m.Success)
                {
                    record.Phone = m.Groups[1].Value.Trim();
                }
            }

            // Fallback: direct visible phone span
            if (string.IsNullOrWhiteSpace(record.Phone))
            {
                var phoneTextSpan = driver.FindElements(By.XPath(
                    "//div[contains(@class,'hiring-applicant-header-actions__more-content-dropdown-item-info')]" +
                    "[.//span[contains(normalize-space(.),'Copy phone number')]]" +
                    "//span[contains(@class,'hiring-applicant-header-actions__more-content-dropdown-item-text')]"))
                    .FirstOrDefault();

                record.Phone = phoneTextSpan?.GetAttribute("textContent")?.Trim() ?? string.Empty;
            }
        }
        catch { }

        return record;
    }

    private static DownloadResult TryDownloadAndMoveResume(
        IWebDriver driver,
        string downloadsFolder,
        string destinationFolder,
        ApplicantRecord record,
        int timeoutSeconds)
    {
        var result = new DownloadResult
        {
            ResumeStatus = "NotAvailable"
        };

        if (!EnsureDownloadButtonVisible(driver))
        {
            result.CustomNotes = "Download button not found.";
            return result;
        }

        var existingFiles = new HashSet<string>(Directory.GetFiles(downloadsFolder), StringComparer.OrdinalIgnoreCase);
        if (!TryClickDownload(driver))
        {
            result.CustomNotes = "Unable to click resume download button.";
            return result;
        }

        var downloadedFilePath = WaitForNewDownloadedFile(downloadsFolder, existingFiles, timeoutSeconds);
        if (string.IsNullOrWhiteSpace(downloadedFilePath) || !File.Exists(downloadedFilePath))
        {
            result.CustomNotes = "No downloaded file detected in Downloads folder.";
            return result;
        }

        var extension = Path.GetExtension(downloadedFilePath);
        if (string.IsNullOrWhiteSpace(extension))
        {
            extension = ".pdf";
        }

        var desiredFileName = BuildResumeFileName(record, extension);
        var destinationPath = Path.Combine(destinationFolder, desiredFileName);

        if (File.Exists(destinationPath))
        {
            result.ResumeStatus = "AlreadyProcessed";
            result.ResumeSavedPath = destinationPath;
            result.CustomNotes = "Destination file already exists. Download skipped.";

            TryDeleteIfExists(downloadedFilePath);
            return result;
        }

        File.Move(downloadedFilePath, destinationPath);
        result.ResumeStatus = "Downloaded";
        result.ResumeSavedPath = destinationPath;
        return result;
    }

    private static bool EnsureDownloadButtonVisible(IWebDriver driver)
    {
        const int maxRefreshAttempts = 2;

        // Try direct download first, then resume tab + download.
        if (TryFocusResumeAndFindDownloadButton(driver))
        {
            return true;
        }

        // LinkedIn sometimes shows a virus-scan placeholder and requires refresh before showing Download.
        if (!IsResumeVirusScanInProgress(driver))
        {
            return false;
        }

        for (int attempt = 1; attempt <= maxRefreshAttempts; attempt++)
        {
            try
            {
                driver.Navigate().Refresh();
            }
            catch
            {
                // If refresh fails, stop retrying and continue without download.
                return false;
            }

            Thread.Sleep(1500);

            if (TryFocusResumeAndFindDownloadButton(driver))
            {
                return true;
            }
        }

        return false;
    }

    private static bool TryFocusResumeAndFindDownloadButton(IWebDriver driver)
    {
        if (FindDownloadButton(driver) != null)
        {
            return true;
        }

        var resumeTab = FindFirstVisibleElement(driver,
            "//*[contains(normalize-space(text()),'Resume')]");
        if (resumeTab != null)
        {
            ClickWebElement(driver, resumeTab);
            Thread.Sleep(600);
        }

        return FindDownloadButton(driver) != null;
    }

    private static IWebElement? FindDownloadButton(IWebDriver driver)
    {
        return FindFirstVisibleElement(driver,
            "//*[@id='hiring-detail-root']/div[3]/div[1]/div[1]/a",
            "//*[contains(normalize-space(text()),'Download')]",
            "//button[contains(normalize-space(text()),'Download')]");
    }

    private static bool IsResumeVirusScanInProgress(IWebDriver driver)
    {
        return FindFirstVisibleElement(driver,
            "//*[@id='hiring-detail-root']//div[contains(@class,'hiring-resume-viewer__virus-scan-section') and contains(normalize-space(.),'Please refresh the page now')]",
            "//*[contains(normalize-space(.),'Scanning resume for viruses') and contains(normalize-space(.),'Please refresh the page now')]") != null;
    }

    private static bool TryClickDownload(IWebDriver driver)
    {
        var element = FindDownloadButton(driver);

        if (element == null)
        {
            return false;
        }

        ClickWebElement(driver, element);
        return true;
    }

    private static string? WaitForNewDownloadedFile(
        string downloadsFolder,
        HashSet<string> existingFiles,
        int timeoutSeconds)
    {
        var start = DateTime.UtcNow;

        while ((DateTime.UtcNow - start).TotalSeconds < timeoutSeconds)
        {
            var tempFiles = Directory.GetFiles(downloadsFolder, "*.crdownload");
            if (tempFiles.Length > 0)
            {
                Thread.Sleep(500);
                continue;
            }

            var newFiles = Directory.GetFiles(downloadsFolder)
                .Where(path =>
                    !existingFiles.Contains(path) &&
                    !path.EndsWith(".tmp", StringComparison.OrdinalIgnoreCase) &&
                    !path.EndsWith(".part", StringComparison.OrdinalIgnoreCase) &&
                    !path.EndsWith(".crdownload", StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(File.GetLastWriteTimeUtc)
                .ToList();

            if (newFiles.Count > 0)
            {
                Thread.Sleep(300);
                return newFiles[0];
            }

            Thread.Sleep(500);
        }

        return null;
    }

    private static IWebElement? FindFirstVisibleElement(IWebDriver driver, params string[] xpaths)
    {
        foreach (var xpath in xpaths)
        {
            try
            {
                var element = driver.FindElements(By.XPath(xpath)).FirstOrDefault(e => e.Displayed);
                if (element != null)
                {
                    return element;
                }
            }
            catch
            {
                // ignore and move to next selector
            }
        }

        return null;
    }

    private static string SafeExtractText(IWebDriver driver, params string[] xpaths)
    {
        foreach (var xpath in xpaths)
        {
            try
            {
                var element = driver.FindElements(By.XPath(xpath)).FirstOrDefault(e => e.Displayed);
                var text = element?.Text?.Trim();
                if (!string.IsNullOrWhiteSpace(text))
                {
                    return text;
                }
            }
            catch
            {
                // ignore and move to next selector
            }
        }

        return string.Empty;
    }

    private static string ExtractProfileUrlFromListItem(IWebElement listItem)
    {
        try
        {
            var link = listItem
                .FindElements(By.XPath(".//a[contains(@href,'/in/') or contains(@href,'/talent/profile/') or contains(@href,'/recruiter/profile/') or contains(@href,'linkedin.com')]"))
                .FirstOrDefault();

            var href = link?.GetAttribute("href")?.Trim();
            return href ?? string.Empty;
        }
        catch
        {
            return string.Empty;
        }
    }

    private static string ExtractProfileUrlFromDetailPanel(IWebDriver driver)
    {
        try
        {
            var link = driver.FindElements(By.XPath("//*[@id='hiring-detail-root']//a[contains(@href,'/in/') or contains(@href,'/talent/profile/') or contains(@href,'/recruiter/profile/') or contains(@href,'linkedin.com')]"))
                .FirstOrDefault();

            return link?.GetAttribute("href")?.Trim() ?? string.Empty;
        }
        catch
        {
            return string.Empty;
        }
    }

    private static string NormalizeProfileUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            return string.Empty;
        }

        var normalized = url.Trim();
        int queryIndex = normalized.IndexOf('?');
        if (queryIndex >= 0)
        {
            normalized = normalized.Substring(0, queryIndex);
        }

        return normalized.TrimEnd('/');
    }

    private static (int Current, int Total) GetPaginationState(IWebDriver driver)
    {
        try
        {
            // Example text: "Page 1 of 62"
            var pageStateText = driver.FindElements(By.XPath(
                    "//div[contains(@class,'artdeco-pagination__page-state')]"))
                .FirstOrDefault()
                ?.GetAttribute("textContent")
                ?.Trim();

            if (!string.IsNullOrWhiteSpace(pageStateText))
            {
                var match = Regex.Match(pageStateText, @"Page\s+(\d+)\s+of\s+(\d+)", RegexOptions.IgnoreCase);
                if (match.Success)
                {
                    return (
                        int.Parse(match.Groups[1].Value),
                        int.Parse(match.Groups[2].Value)
                    );
                }
            }

            // Fallback: derive current page from aria-current button
            var currentBtn = driver.FindElements(By.XPath(
                    "//ul[contains(@class,'artdeco-pagination__pages')]//button[@aria-current='true']"))
                .FirstOrDefault();

            if (currentBtn != null)
            {
                var currentText = currentBtn.GetAttribute("textContent")?.Trim();
                if (int.TryParse(currentText, out var current))
                {
                    // Total unknown in fallback
                    return (current, -1);
                }
            }
        }
        catch
        {
            // ignore
        }

        return (-1, -1);
    }

    private static bool TryGoToNextApplicantsPage(IWebDriver driver, int timeoutSeconds)
    {
        var (currentPage, totalPages) = GetPaginationState(driver);

        // Stop condition: reached last page
        if (currentPage > 0 && totalPages > 0 && currentPage >= totalPages)
        {
            return false;
        }

        var targetPage = currentPage > 0 ? currentPage + 1 : -1;

        // Prefer explicit page-number button, fallback to Next button selectors
        IWebElement? nextButton = null;
        if (targetPage > 0)
        {
            nextButton = FindFirstVisibleElement(driver,
                $"//li[@data-test-pagination-page-btn='{targetPage}']//button",
                $"//button[@aria-label='Page {targetPage}']",
                $"//button[@aria-label='Page {targetPage}' and not(@disabled)]");
        }

        if (nextButton == null)
        {
            nextButton = FindFirstVisibleElement(driver,
                "//button[contains(@aria-label,'Next') and not(@disabled)]",
                "//button[contains(@class,'artdeco-pagination__button--next') and not(@disabled)]",
                "//button[contains(., 'Next') and not(@disabled)]");
        }

        if (nextButton == null)
        {
            return false;
        }

        ClickWebElement(driver, nextButton);

        // Wait until page number changes (or list refreshes)
        var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(timeoutSeconds));
        wait.Until(_ =>
        {
            var (newCurrent, _) = GetPaginationState(driver);
            if (targetPage > 0 && newCurrent == targetPage)
            {
                return true;
            }

            // If pagination state not readable, let list wait handle it
            return newCurrent > currentPage;
        });

        WaitForApplicantList(driver, timeoutSeconds);
        return true;
    }

    private static void ClickWebElement(IWebDriver driver, IWebElement element)
    {
        try
        {
            element.Click();
        }
        catch
        {
            var js = driver as IJavaScriptExecutor;
            if (js != null)
            {
                js.ExecuteScript("arguments[0].click();", element);
            }
            else
            {
                throw;
            }
        }
    }

    private static string BuildResumeFileName(ApplicantRecord record, string extension)
    {
        var applicant = SanitizeFileToken(record.ApplicantName, "Applicant");
        var profileId = SanitizeFileToken(ExtractProfileId(record.ApplicantKey), "ApplicantKey");
        return $"{applicant}_{profileId}_{extension}";
    }

    private static string ExtractProfileId(string? profileUrl)
    {
        if (string.IsNullOrWhiteSpace(profileUrl))
        {
            return "UnknownProfile";
        }

        var trimmed = NormalizeProfileUrl(profileUrl);
        if (string.IsNullOrWhiteSpace(trimmed))
        {
            return "UnknownProfile";
        }

        var parts = trimmed.Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
        return parts.LastOrDefault() ?? "UnknownProfile";
    }

    private static string ExtractJobPostingId(string jobPostingUrl)
    {
        if (string.IsNullOrWhiteSpace(jobPostingUrl))
        {
            return "UnknownJob";
        }

        var regex = Regex.Match(jobPostingUrl, @"/jobs/view/(\d+)", RegexOptions.IgnoreCase);
        if (regex.Success)
        {
            return regex.Groups[1].Value;
        }

        var parts = jobPostingUrl.Split(new[] { '/', '?' }, StringSplitOptions.RemoveEmptyEntries);
        return parts.LastOrDefault() ?? "UnknownJob";
    }

    private static string SanitizeFileToken(string? value, string fallback)
    {
        var token = string.IsNullOrWhiteSpace(value) ? fallback : value;
        foreach (var invalid in Path.GetInvalidFileNameChars())
        {
            token = token.Replace(invalid, '_');
        }

        token = Regex.Replace(token, @"\s+", "_").Trim('_');
        return string.IsNullOrWhiteSpace(token) ? fallback : token;
    }

    private static string RegexMatch(string input, string pattern, RegexOptions options)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return string.Empty;
        }

        var match = Regex.Match(input, pattern, options);
        return match.Success ? match.Value : string.Empty;
    }

    private static string GetDefaultDownloadsFolder()
    {
        var userProfile = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
        var downloads = Path.Combine(userProfile, "Downloads");

        if (!Directory.Exists(downloads))
        {
            throw new DirectoryNotFoundException("Default Downloads folder was not found.");
        }

        return downloads;
    }

    private static void TryDeleteIfExists(string path)
    {
        try
        {
            if (!string.IsNullOrWhiteSpace(path) && File.Exists(path))
            {
                File.Delete(path);
            }
        }
        catch
        {
            // no-op cleanup
        }
    }

    private sealed class ApplicantRecord
    {
        public string? ApplicantName { get; set; }
        public string? ApplicantKey { get; set; }
        public string? ApplicantUrl { get; set; }
        public string? ProfileUrl { get; set; }
        public string? Location { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? ResumeSavedPath { get; set; }
        public string? ResumeStatus { get; set; }
        public string? ProcessingStatus { get; set; }
        public DateTime ProcessedAt { get; set; }
        public string? ErrorMessage { get; set; }
    }

    private sealed class DownloadResult
    {
        public string? ResumeStatus { get; set; }
        public string? ResumeSavedPath { get; set; }
        public string? CustomNotes { get; set; }
    }
}
