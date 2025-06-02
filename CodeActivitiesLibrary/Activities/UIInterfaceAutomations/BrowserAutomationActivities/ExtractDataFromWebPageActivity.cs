using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;


namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Extract Data From Web Page")]
    [Description("Extracts data from a specified UI element on a web page using configurable parameters.")]
    public class ExtractDataFromWebPageActivity : Extensions.BaseCodeActivity
    {
        #region Status Output

        
        

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            var statusMessage = "";

            try
            {
                var webBrowserInstanceId = WebBrowserInstance.Get(context);
                var extractionMode = ExtractionMode.Get(context);
                var storeDataMode = StoreDataMode.Get(context);

                // Simulate execution logic here
                statusMessage = $"Extracting data from web page using '{extractionMode}' mode.";

                if (storeDataMode == StoreDataModeEnum.ExcelSpreadsheet)
                    OExcelInstanceOutput.Set(context, "GeneratedExcelInstance");
                else
                    ODataFromWebPageOutput.Set(context, new object());

                // Optional: Add real implementation here to interact with browser automation
            }
            catch (Exception ex)
            {
                statusMessage = $"Error extracting data: {ex.Message}";
            }

            StatusMessage.Set(context, statusMessage);
        }

        #region Inputs

        [RequiredArgument]
        [Category("Input")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<string> WebBrowserInstance { get; set; }

        [Browsable(false)]
        [Description("Select the UI element on the web page to capture.")]
        public InArgument<string> UiElement { get; set; }

        [Category("Input")]
        [Description(
            "The parameters to use when extracting data. Depending on the extraction mode, this parameter accepts different data.")]
        public InArgument<string> ExtractionParameter { get; set; }

        [Category("Input")]
        [Description("The maximum number of web pages to process.")]
        public InArgument<int> MaxWebPagesToProcess { get; set; }

        [Category("Input")]
        [Description("Send physical click for next page navigation.")]
        public InArgument<bool> SendPhysicalClickForNextPage { get; set; }

        [Category("Input")]
        [Description("CSS selector used to identify the pagination element.")]
        public InArgument<string> PageCssSelector { get; set; }

        [Category("Input")]
        [Description("Specify what to extract from the web page.")]
        public InArgument<ExtractionModeEnum> ExtractionMode { get; set; }

        [Category("Input")]
        [Description("Specify whether to use paging during extraction.")]
        public InArgument<bool> UsePaging { get; set; }

        [Category("Input")]
        [Description("Specify whether to extract all available web pages.")]
        public InArgument<bool> GetAllWebPages { get; set; }

        [Category("Input")]
        [Description(
            "Specify whether to process extracted data to match visual display (e.g., handling hidden elements). Not recommended for large datasets.")]
        public InArgument<bool> ProcessDataUponExtraction { get; set; }

        [Category("Input")]
        [DefaultValue(60)]
        [Description("Set the time in seconds to wait for the extraction before it fails.")]
        public InArgument<int> TimeOut { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("Specify whether to store the extracted data in a variable or an Excel spreadsheet.")]
        public InArgument<StoreDataModeEnum> StoreDataMode { get; set; }

        #endregion

        #region Outputs

        [Category("Output")]
        [Description("The Excel instance with the extracted data. Use this instance to manipulate the spreadsheet.")]
        public OutArgument<string> OExcelInstanceOutput { get; set; }

        [Category("Output")]
        [Description("The extracted data in the form of a single value, list, data row, or data table.")]
        public OutArgument<object> ODataFromWebPageOutput { get; set; }

        #endregion
    }

    public enum ExtractionModeEnum
    {
        [Display(Name = "Undefined", Description = "No specific extraction mode selected.")]
        Undefined = 0,

        [Display(Name = "Single Value", Description = "Extracts a single value from the webpage.")]
        SingleValue = 1,

        [Display(Name = "Handpicked Values", Description = "Extracts manually selected values.")]
        HandpickedValues = 2,

        [Display(Name = "List", Description = "Extracts a list of items.")]
        List = 3,

        [Display(Name = "Table", Description = "Extracts tabular data.")]
        Table = 4,

        [Display(Name = "Entire HTML Table", Description = "Extracts the entire HTML table structure.")]
        EntireHtmlTable = 5
    }

    public enum StoreDataModeEnum
    {
        [Display(Name = "Variable", Description = "Stores extracted data in a variable.")]
        Variable = 0,

        [Display(Name = "Excel Spreadsheet", Description = "Stores extracted data in an Excel spreadsheet.")]
        ExcelSpreadsheet = 1
    }
}