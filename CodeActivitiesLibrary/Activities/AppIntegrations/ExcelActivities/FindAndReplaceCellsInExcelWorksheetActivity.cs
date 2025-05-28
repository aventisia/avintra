using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    // Activity to find and replace cells in the active worksheet of an Excel instance
    [DisplayName("Find and Replace Cells in Excel Worksheet"),
     Description("Finds text and replaces it with another in the active worksheet of an Excel instance.")]
    public class FindAndReplaceCellsInExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The text to find.")]
        public InArgument<string> TextToFind { get; set; }

        [RequiredArgument, Category("Input"), Description("The text to replace with.")]
        public InArgument<string> TextToReplaceWith { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var textToFind = TextToFind.Get(context);
            var textToReplaceWith = TextToReplaceWith.Get(context);
            var status = "";

            try
            {
                // Simulate finding and replacing cells (actual implementation would use Excel Interop or similar)
                status = $"Simulated find and replace of text '{textToFind}' with '{textToReplaceWith}' in Excel instance '{excelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error finding and replacing cells: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}