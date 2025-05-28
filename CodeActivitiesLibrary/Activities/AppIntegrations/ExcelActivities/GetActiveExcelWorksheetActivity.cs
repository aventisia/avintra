using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{

    // Activity to get the active Excel worksheet
    [DisplayName("Get Active Excel Worksheet"), Description("Retrieves an Excel document's active worksheet.")]
    public class GetActiveExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [Category("Output"), Description("Returns the name of the active worksheet.")]
        public OutArgument<string> Result { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var result = "";
            var status = "";

            try
            {
                // Simulate retrieving the active worksheet (actual implementation would use Excel Interop or similar)
                result = "Sheet1"; // Simulated active worksheet name
                status = "Active worksheet retrieved successfully.";
            }
            catch (Exception ex)
            {
                result = "";
                status = $"Error retrieving active worksheet: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}
