using NodeLibrary.BrowserAutomationNodes.Enums;
using NodeLibrary.BrowserAutomationNodes.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using DataTable = System.Data.DataTable;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("Extract Data From Web Page"), Description("Extracts data from a specified UI element on a web page using configurable parameters.")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg")]
public class ExtractDataFromWebPageNode : BaseNode
{
    [DisplayName("Web Browser Instance"), Description("Enter or choose the variable that contains the web browser instance to work with.")]
    public required InArgument<IWebDriver> WebBrowserInstance { get; set; }

    [DisplayName("Find Type"), Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
    public InArgument<ElementSelectorTypeEnum> FindType { get; set; } = new InArgument<ElementSelectorTypeEnum>(ElementSelectorTypeEnum.XPath);

    [DisplayName("Value To Find"), Description("The selector used to locate the element on the web page.")]
    public required InArgument<string> ValueToFind { get; set; }

    [DisplayName("Extraction Mode"), Description("Specifies what type of data to extract (e.g., single value, list, table).")]
    public InArgument<ExtractionModeEnum> ExtractionMode { get; set; } = new InArgument<ExtractionModeEnum>(ExtractionModeEnum.SingleValue);

    [DisplayName("Use Paging"), Description("If true, processes multiple pages by navigating through pagination.")]
    public InArgument<bool> UsePaging { get; set; } = new InArgument<bool>(false);

    [DisplayName("Get All Web Pages"), Description("If true, extracts data from all available pages. Otherwise, only the first page is used.")]
    public InArgument<bool> GetAllWebPages { get; set; } = new InArgument<bool>(false);

    [DisplayName("Max Web Pages To Process"), Description("The maximum number of web pages to process when using 'Use Paging'.")]
    public InArgument<int> MaxWebPagesToProcess { get; set; } = new InArgument<int>(10);

    [DisplayName("Page CSS Selector"), Description("CSS selector used to locate the next page navigation element.")]
    public InArgument<string> PageCssSelector { get; set; } = new InArgument<string>("");

    [DisplayName("Send Physical Click for Next Page"), Description("If true, simulates physical mouse click to navigate to the next page.")]
    public InArgument<bool> SendPhysicalClickForNextPage { get; set; } = new InArgument<bool>(false);

    [DisplayName("Process Data Upon Extraction"), Description("If true, processes the data to match visual display (e.g., handles hidden elements).")]
    public InArgument<bool> ProcessDataUponExtraction { get; set; } = new InArgument<bool>(false);

    [DisplayName("Timeout Seconds"), Description("Maximum time in seconds to wait for an element before failing.")]
    public InArgument<int> Timeout { get; set; } = new InArgument<int>(60);

    [DisplayName("Data From Web Page Output"), Description("Returns the extracted data as a single value, list, data row, or data table.")]
    public OutArgument<object> DataFromWebPageOutput { get; set; } = new OutArgument<object>();

    protected override void Execute(INodeContext context)
    {
        var status = string.Empty;
        object? outputData = null;

        try
        {
            var driver = WebBrowserInstance.Get(context);
            var uiElement = ValueToFind.Get(context);
            var findType = FindType.Get(context);
            var extractionMode = ExtractionMode.Get(context);
            var timeout = Timeout.Get(context);

            if (driver == null)
                throw new ArgumentNullException(nameof(driver), "Web browser instance cannot be null.");

            if (string.IsNullOrWhiteSpace(uiElement))
                throw new ArgumentException("Selector value cannot be empty.");

            var by = BrowserAutomationHelper.GetWebElementLocator(findType, uiElement);
            if (by == null)
                throw new ArgumentException("Invalid selector type.");

            var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(timeout));
            wait.Until(drv => drv.FindElement(by));

            switch (extractionMode)
            {
                case ExtractionModeEnum.SingleValue:
                    var singleElement = driver.FindElement(by);
                    outputData = singleElement.Text.Trim();
                    status = $"Extracted single value: {outputData}";
                    break;

                case ExtractionModeEnum.List:
                    wait.Until(drv => drv.FindElements(by).Count > 0);
                    var elements = driver.FindElements(by);
                    var list = elements
                        .Select(e => e.Text.Trim())
                        .Where(text => !string.IsNullOrWhiteSpace(text))
                        .ToList();
                    outputData = list;
                    status = $"Extracted list with {list.Count} items.";
                    break;

                case ExtractionModeEnum.Table:
                    var tableElement = driver.FindElement(by);
                    outputData = ExtractTable(tableElement);
                    status = "Extracted table data.";
                    break;

                case ExtractionModeEnum.EntireHtmlTable:
                    var htmlElement = driver.FindElement(by);
                    outputData = htmlElement?.GetAttribute("outerHTML") ?? string.Empty;
                    status = "Extracted full HTML table.";
                    break;

                case ExtractionModeEnum.HandpickedValues:
                    throw new NotSupportedException("HandpickedValues extraction mode is not implemented.");

                default:
                    throw new NotSupportedException("Unsupported extraction mode.");
            }

            DataFromWebPageOutput.Set(context, outputData);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error: {ex.Message}");
            DataFromWebPageOutput.Set(context, null);
        }
    }

    private DataTable ExtractTable(IWebElement tableElement)
    {
        var table = new DataTable();
        var rows = tableElement.FindElements(By.TagName("tr"));

        if (rows.Count == 0)
            return table;

        // Headers
        var headers = rows[0].FindElements(By.TagName("th"));
        if (headers.Count > 0)
        {
            foreach (var th in headers)
                table.Columns.Add(th.Text.Trim());
        }
        else
        {
            int columns = rows[0].FindElements(By.TagName("td")).Count;
            for (int i = 0; i < columns; i++)
                table.Columns.Add($"Column{i + 1}");
        }

        // Data rows
        foreach (var row in rows.Skip(1))
        {
            var cells = row.FindElements(By.TagName("td"));
            if (cells.Count == 0)
                continue;

            var dataRow = table.NewRow();
            for (int i = 0; i < cells.Count && i < table.Columns.Count; i++)
                dataRow[i] = cells[i].Text.Trim();

            table.Rows.Add(dataRow);
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
