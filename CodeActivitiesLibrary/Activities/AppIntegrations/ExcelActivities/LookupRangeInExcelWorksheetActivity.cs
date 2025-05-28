using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    // Activity to perform a lookup range operation in an Excel worksheet
    [DisplayName("Lookup Range in Excel Worksheet"),
     Description("Finds and returns the result of Excel's LOOKUP function.")]
    public class LookupRangeInExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The lookup value.")]
        public InArgument<string> LookupValue { get; set; }

        [RequiredArgument, Category("Input"), Description("The range to search for the lookup value (e.g., 'A1:B10').")]
        public InArgument<string> SearchRange { get; set; }

        [Category("Output"), Description("Returns the result of the lookup operation.")]
        public OutArgument<string> Result { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var lookupValue = LookupValue.Get(context);
            var searchRange = SearchRange.Get(context);
            var result = "";
            var status = "";

            try
            {
                // Simulate performing lookup range operation (actual implementation would use Excel Interop or similar)
                result = "Simulated lookup result";
                status = "Lookup range operation completed successfully.";
            }
            catch (Exception ex)
            {
                result = "";
                status = $"Error performing lookup range operation: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}