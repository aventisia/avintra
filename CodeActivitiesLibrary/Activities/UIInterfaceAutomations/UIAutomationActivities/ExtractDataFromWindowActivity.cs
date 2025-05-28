using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Extract Data from Window")]
    [Description("Extracts data from specific parts of a window in the form of single values, lists, or tables.")]
    public class ExtractDataFromWindowActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The handle or identifier of the window.")]
        public InArgument<string> WindowHandle { get; set; }

        [Category("Output")]
        [Description("Returns the extracted data as a string.")]
        public OutArgument<string> ExtractedData { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var windowHandle = WindowHandle.Get(context);
            string extractedData = null;
            string status = "";

            try
            {
                if (string.IsNullOrEmpty(windowHandle))
                {
                    throw new ArgumentException("Window handle cannot be null or empty.");
                }

                // Simulate extracting data using a hypothetical API
                extractedData = "Extracted Data: Sample Data";
                StatusMessage.Set(context, "Data extracted successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error extracting data: {ex.Message}";
            }

            ExtractedData.Set(context, extractedData);
            StatusMessage.Set(context, status);
        }
    }
}