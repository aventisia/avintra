using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities.Enums;
using CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using DataTable = System.Data.DataTable;


namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Extract Data From Web Page")]
    [Description("Extracts data from a specified UI element on a web page using configurable parameters.")]
    public class ExtractDataFromWebPageActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<IWebDriver> WebBrowserInstance { get; set; }


        [DisplayName("Find Type")]
        [Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
        [DefaultValue(ElementSelectorTypeEnum.XPath)]
        public InArgument<ElementSelectorTypeEnum> FindType { get; set; } =
            new InArgument<ElementSelectorTypeEnum>(ElementSelectorTypeEnum.XPath);

        [DisplayName("Value To Find")]
        [Description("The selector used to locate the link or button on the web page.")]
        public InArgument<string> ValueToFind { get; set; }


        [DisplayName("Extraction Mode")]
        [Description("Specifies what type of data to extract (e.g., single value, list, table).")]
        [DefaultValue(ExtractionModeEnum.SingleValue)]
        public InArgument<ExtractionModeEnum> ExtractionMode { get; set; }


        [DisplayName("Use Paging")]
        [Description("If true, processes multiple pages by navigating through pagination.")]
        public InArgument<bool> UsePaging { get; set; }


        [DisplayName("Get All Web Pages")]
        [Description("If true, extracts data from all available pages. Otherwise, only the first page is used.")]
        public InArgument<bool> GetAllWebPages { get; set; }


        [DisplayName("Max Web Pages To Process")]
        [Description("The maximum number of web pages to process when using 'Use Paging'.")]
        [DefaultValue(10)]
        public InArgument<int> MaxWebPagesToProcess { get; set; }


        [DisplayName("Page CSS Selector")]
        [Description("CSS selector used to locate the next page navigation element.")]
        public InArgument<string> PageCssSelector { get; set; }


        [DisplayName("Send Physical Click for Next Page")]
        [Description("If true, simulates physical mouse click to navigate to the next page.")]
        public InArgument<bool> SendPhysicalClickForNextPage { get; set; }


        [DisplayName("Process Data Upon Extraction")]
        [Description(
            "If true, processes the data to match visual display (e.g., handles hidden elements). Not recommended for large datasets.")]
        public InArgument<bool> ProcessDataUponExtraction { get; set; }


        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds to wait for an element before failing.")]
        [DefaultValue(60)]
        public InArgument<int> Timeout { get; set; }

        [DisplayName("Excel Instance Output")]
        [Description("Returns the Excel instance if storing data in Excel.")]
        public OutArgument<string> ExcelInstanceOutput { get; set; }


        [DisplayName("Data From Web Page Output")]
        [Description("Returns the extracted data as a single value, list, data row, or data table.")]
        public OutArgument<object> DataFromWebPageOutput { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            object outputData = null;

            try
            {
                var driver = WebBrowserInstance.Get(context);
                var uiElement = ValueToFind.Get(context);
                var findType = FindType.Get(context);
                var extractionMode = ExtractionMode.Get(context);
                var usePaging = UsePaging.Get(context);
                var getAllPages = GetAllWebPages.Get(context);
                var maxPages = MaxWebPagesToProcess.Get(context);
                var pageCssSelector = PageCssSelector.Get(context);
                var sendPhysicalClick = SendPhysicalClickForNextPage.Get(context);
                var processData = ProcessDataUponExtraction.Get(context);
                var timeout = Timeout.Get(context);

                if (driver == null)
                    throw new ArgumentException("Web browser instance cannot be null.");

                if (string.IsNullOrWhiteSpace(uiElement))
                    throw new ArgumentException("UI Element must be specified.");

                // Locate the target element
                var by = BrowserAutomationHelper.GetWebElementLocator(findType, uiElement);
                if (by == null)
                    throw new ArgumentException("Invalid find type provided.");

                var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(timeout));
                var element = wait.Until(drv => drv.FindElement(by));

                switch (extractionMode)
                {
                    case ExtractionModeEnum.SingleValue:
                        outputData = element.Text.Trim();
                        status = $"Extracted single value: '{outputData}'";
                        break;

                    case ExtractionModeEnum.List:
                        var elements = driver.FindElements(by);
                        var dataList = elements.Select(el => el.Text).ToList();

                        outputData = dataList;
                        status = $"Extracted list with {dataList.Count} items.";
                        break;

                    case ExtractionModeEnum.Table:
                        var dataTable = ExtractTable(element);
                        outputData = dataTable;
                        status = $"Extracted table with {dataTable.Rows.Count} rows.";
                        break;

                    case ExtractionModeEnum.EntireHtmlTable:
                        outputData = element.GetAttribute("outerHTML");
                        status = "Extracted entire HTML table structure.";
                        break;

                    case ExtractionModeEnum.HandpickedValues:
                    default:
                        throw new ArgumentOutOfRangeException(nameof(extractionMode), "Unsupported extraction mode.");
                }

                DataFromWebPageOutput.Set(context, outputData);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error extracting data: {ex.Message}";
                outputData = null;
                ExcelInstanceOutput.Set(context, false);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }

        private static DataTable ExtractTable(IWebElement tableElement)
        {
            var table = new DataTable();
            var rows = tableElement.FindElements(By.TagName("tr"));

            if (rows.Count == 0) return table;

            // Process headers
            var headers = rows[0].FindElements(By.TagName("th"));
            foreach (var header in headers) table.Columns.Add(header.Text.Trim());

            // Process rows
            for (var i = 1; i < rows.Count; i++)
            {
                var cells = rows[i].FindElements(By.TagName("td"));
                if (cells.Count == 0) continue;

                var row = table.NewRow();
                for (var j = 0; j < Math.Min(cells.Count, table.Columns.Count); j++) row[j] = cells[j].Text.Trim();

                table.Rows.Add(row);
            }

            return table;
        }
    }

    public enum ExtractionModeEnum
    {
        [Display(Name = "Single Value", Description = "Extracts a single text value from the web page.")]
        SingleValue,

        [Display(Name = "Handpicked Values", Description = "Extracts manually selected values from multiple elements.")]
        HandpickedValues,

        [Display(Name = "List", Description = "Extracts a list of items from repeated elements.")]
        List,

        [Display(Name = "Table", Description = "Extracts tabular data from a web table.")]
        Table,

        [Display(Name = "Entire HTML Table", Description = "Extracts the complete HTML table structure.")]
        EntireHtmlTable
    }
}