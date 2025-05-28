using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    // Activity to save an Excel instance
    [DisplayName("Save Excel"), Description("Saves a previously launched Excel instance.")]
    public class SaveExcelActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var status = "";

            try
            {
                // Simulate saving Excel (actual implementation would use Excel Interop or similar)
                status = $"Simulated save of Excel instance '{excelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error saving Excel: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}
