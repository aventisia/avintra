using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    // Activity to get all Excel worksheets
    [DisplayName("Get All Excel Worksheets"), Description("Retrieves all worksheet names of an Excel document.")]
    public class GetAllExcelWorksheetsActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [Category("Output"), Description("Returns the list of worksheet names.")]
        public OutArgument<IEnumerable<string>> Result { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            IEnumerable<string> result = null;
            var status = "";

            try
            {
                // Simulate retrieving all worksheets (actual implementation would use Excel Interop or similar)
                result = new List<string> { "Sheet1", "Sheet2", "Sheet3" }; // Simulated worksheet names
                status = "All worksheets retrieved successfully.";
            }
            catch (Exception ex)
            {
                result = null;
                status = $"Error retrieving all worksheets: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}