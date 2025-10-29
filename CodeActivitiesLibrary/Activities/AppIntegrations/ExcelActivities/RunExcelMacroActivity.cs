using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Run Excel Macro")]
    [Description("Runs a specified VBA macro in the provided Excel workbook.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class RunExcelMacroActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Workbook Instance")]
        [Description("The Excel Workbook object containing the target macro.")]
        public InArgument<Excel.Workbook> WorkbookInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Macro Name")]
        [Description("The name of the VBA macro to execute. For example: 'Module1.MyMacro'")]
        public InArgument<string> MacroName { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("Macro Return Value")]
        [Description("Returns the value returned by the macro, if any.")]
        public OutArgument<string> MacroReturnValue { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            string returnValue = string.Empty;

            try
            {
                var workbook = WorkbookInstance.Get(context);
                var macroName = MacroName.Get(context);

                if (workbook == null)
                    throw new InvalidOperationException("Workbook instance cannot be null.");

                if (string.IsNullOrWhiteSpace(macroName))
                    throw new ArgumentException("Macro name cannot be empty.");

                var excelApp = workbook.Application;

                if (excelApp == null)
                    throw new InvalidOperationException("Unable to retrieve the Excel Application instance.");

                // Call the macro
                var result = excelApp.Run(macroName);

                // Capture return value (if any)
                returnValue = result?.ToString() ?? "None";
                MacroReturnValue.Set(context, returnValue);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully executed macro '{macroName}'.");
            }
            catch (Exception ex)
            {
                MacroReturnValue.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error running macro: {ex.Message}");
            }
        }
    }
}