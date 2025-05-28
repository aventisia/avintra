using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{

    // Activity to run an Excel macro
    [DisplayName("Run Excel Macro"), Description("Runs a specified macro on the document of an Excel instance.")]
    public class RunExcelMacroActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The name of the macro to run.")]
        public InArgument<string> MacroName { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var macroName = MacroName.Get(context);
            var status = "";

            try
            {
                // Simulate running the macro (actual implementation would use Excel Interop or similar)
                status = $"Simulated execution of macro '{macroName}' in Excel instance '{excelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error running macro: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}