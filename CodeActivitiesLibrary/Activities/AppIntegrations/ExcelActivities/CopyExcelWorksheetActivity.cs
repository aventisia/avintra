using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{

    // Activity to copy an Excel worksheet
    [DisplayName("Copy Excel Worksheet"),
     Description(
         "Copies a worksheet from an Excel document and paste it to the Excel document of the same or different Excel instance.")]
    public class CopyExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The source Excel instance ID or token.")]
        public InArgument<string> SourceExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The name of the worksheet to copy.")]
        public InArgument<string> SourceWorksheetName { get; set; }

        [RequiredArgument, Category("Input"), Description("The target Excel instance ID or token.")]
        public InArgument<string> TargetExcelInstanceId { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var sourceExcelInstanceId = SourceExcelInstanceId.Get(context);
            var sourceWorksheetName = SourceWorksheetName.Get(context);
            var targetExcelInstanceId = TargetExcelInstanceId.Get(context);
            var status = "";

            try
            {
                // Simulate copying the worksheet (actual implementation would use Excel Interop or similar)
                status = $"Simulated copying of worksheet '{sourceWorksheetName}' from Excel instance '{sourceExcelInstanceId}' to '{targetExcelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error copying worksheet: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}