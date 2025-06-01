using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    // [DisplayName("Extract Data from Table")]
    // [Description("Extracts data from a table in the form of a datatable.")]
    public class ExtractDataFromTableActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The handle or identifier of the window.")]
        public InArgument<string> WindowHandle { get; set; }

        [Category("Output")]
        [Description("Returns the extracted table data as a string.")]
        public OutArgument<string> ExtractedTableData { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        

        protected override void Execute(CodeActivityContext context)
        {
            var windowHandle = WindowHandle.Get(context);
            string extractedTableData = null;
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(windowHandle))
                {
                    throw new ArgumentException("Window handle cannot be null or empty.");
                }

                // Simulate extracting table data using a hypothetical API
                extractedTableData = "Table Data: Row1, Row2, Row3";
                StatusMessage.Set(context, "Table data extracted successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error extracting table data: {ex.Message}";
            }

            ExtractedTableData.Set(context, extractedTableData);
            StatusMessage.Set(context, status);
        }
    }
}